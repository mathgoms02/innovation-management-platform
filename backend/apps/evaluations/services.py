from django.db import transaction
from django.db.models import Avg
from rest_framework.exceptions import ValidationError
from .models import Evaluation, Score, Criterion
from apps.users.models import User

class EvaluationService:
    @staticmethod
    @transaction.atomic
    def create_evaluation(judge, submission, scores_data, comments=None):
        """
        Cria ou atualiza uma avaliação para uma submissão.
        scores_data deve ser uma lista de dicionários: [{'criterion_id': int, 'value': float}]
        """
        # 1. Validar se o usuário é um jurado
        if judge.role != User.Role.JUDGE:
            raise ValidationError("Apenas usuários com papel de Jurado podem avaliar.")
            
        hackathon = submission.team.hackathon
        
        # 2. Validar o status do hackathon
        if hackathon.status not in ['ONGOING', 'COMPLETED']:
            raise ValidationError("Este hackathon não está em uma fase que permite avaliação.")
            
        # 3. Criar ou atualizar a Avaliação principal
        evaluation, created = Evaluation.objects.update_or_create(
            submission=submission,
            judge=judge,
            defaults={'comments': comments}
        )
        
        # 4. Processar as notas por critério
        all_hackathon_criteria = Criterion.objects.filter(hackathon=hackathon)
        provided_criterion_ids = [item.get('criterion_id') for item in scores_data]
        
        # Verificar se todos os critérios fornecidos pertencem ao hackathon
        if all_hackathon_criteria.filter(id__in=provided_criterion_ids).count() != len(provided_criterion_ids):
            raise ValidationError("Um ou mais critérios fornecidos são inválidos para este hackathon.")
            
        # BUG FIX: Verificar se TODOS os critérios do hackathon foram pontuados
        if all_hackathon_criteria.count() != len(provided_criterion_ids):
            missing_criteria = all_hackathon_criteria.exclude(id__in=provided_criterion_ids).values_list('name', flat=True)
            raise ValidationError(f"Todos os critérios devem ser avaliados. Faltando: {', '.join(missing_criteria)}")

        for item in scores_data:
            criterion_id = item.get('criterion_id')
            value = item.get('value')
            
            if not (0 <= value <= 10):
                raise ValidationError(f"A nota do critério {criterion_id} deve estar entre 0 e 10.")
                
            Score.objects.update_or_create(
                evaluation=evaluation,
                criterion_id=criterion_id,
                defaults={'value': value}
            )
            
        return evaluation

    @staticmethod
    def get_ranking(hackathon):
        """
        Calcula o ranking das equipes baseado na média ponderada das avaliações dos jurados.
        Inclui todas as equipes inscritas, mesmo as sem submissão.
        """
        from apps.teams.models import Team
        from django.db.models import Count
        
        teams = Team.objects.filter(hackathon=hackathon).select_related('submission')
        ranking = []
        
        criteria = list(Criterion.objects.filter(hackathon=hackathon))
        total_weight = sum(c.weight for c in criteria)
        
        if total_weight == 0:
            total_weight = 1

        # Mapeia contagem de avaliações por submissão
        evals_query = Evaluation.objects.filter(submission__team__hackathon=hackathon)
        evals_counts = {item['submission_id']: item['count'] for item in evals_query.values('submission_id').annotate(count=Count('id'))}

        # Mapeia as médias por critério e submissão num único dicionário (sub_id -> {crit_id: avg_value})
        avg_scores_query = Score.objects.filter(evaluation__submission__team__hackathon=hackathon)\
            .values('evaluation__submission_id', 'criterion_id')\
            .annotate(avg=Avg('value'))
        
        avg_scores_map = {}
        for row in avg_scores_query:
            sub_id = row['evaluation__submission_id']
            crit_id = row['criterion_id']
            if sub_id not in avg_scores_map:
                avg_scores_map[sub_id] = {}
            avg_scores_map[sub_id][crit_id] = row['avg']

        for team in teams:
            submission = getattr(team, 'submission', None)
            
            if not submission:
                ranking.append({
                    'team_id': team.id,
                    'team_name': team.name,
                    'final_score': 0.0,
                    'evaluations_count': 0,
                    'status': 'NO_SUBMISSION'
                })
                continue

            evaluations_count = evals_counts.get(submission.id, 0)
            
            if evaluations_count == 0:
                ranking.append({
                    'team_id': team.id,
                    'team_name': team.name,
                    'final_score': 0.0,
                    'evaluations_count': 0,
                    'status': 'NOT_EVALUATED'
                })
                continue
                
            total_weighted_score = 0
            
            for criterion in criteria:
                avg_value = avg_scores_map.get(submission.id, {}).get(criterion.id, 0.0)
                total_weighted_score += float(avg_value) * float(criterion.weight)
                
            final_score = total_weighted_score / total_weight if total_weight > 0 else total_weighted_score
            
            ranking.append({
                'team_id': team.id,
                'team_name': team.name,
                'final_score': round(final_score, 2),
                'evaluations_count': evaluations_count,
                'status': 'EVALUATED'
            })
            
        ranking.sort(key=lambda x: x['final_score'], reverse=True)
        return ranking
