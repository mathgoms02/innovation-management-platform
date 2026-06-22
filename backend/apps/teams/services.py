from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from .models import Team, TeamMember, TeamJoinRequest
from apps.monitoring.services import send_global_notification


class TeamService:
    @staticmethod
    def _assert_open_for_registration(hackathon):
        if hackathon.status not in ['PUBLISHED', 'ONGOING']:
            raise ValidationError("Este hackathon não está aberto para inscrições.")
        if hackathon.registration_deadline < timezone.now():
            raise ValidationError("O prazo de inscrições para este hackathon já encerrou.")

    @staticmethod
    @transaction.atomic
    def create_team(hackathon, name, leader):
        TeamService._assert_open_for_registration(hackathon)

        if Team.objects.filter(hackathon=hackathon, members=leader).exists():
            raise ValidationError("Você já faz parte de uma equipe neste hackathon.")

        # Regra de negócio: um participante só pode liderar uma equipe por hackathon.
        if Team.objects.filter(hackathon=hackathon, leader=leader).exists():
            raise ValidationError("Você já lidera uma equipe neste hackathon.")

        team = Team.objects.create(name=name, hackathon=hackathon, leader=leader)
        TeamMember.objects.create(team=team, user=leader)
        return team

    @staticmethod
    @transaction.atomic
    def join_team(team, user):
        """Entrada direta (usada pelo fluxo de aprovação e por testes)."""
        TeamService._assert_open_for_registration(team.hackathon)

        if Team.objects.filter(hackathon=team.hackathon, members=user).exists():
            raise ValidationError("Você já faz parte de uma equipe neste hackathon.")

        return TeamMember.objects.create(team=team, user=user)

    @staticmethod
    @transaction.atomic
    def request_to_join(team, user):
        """Participante solicita entrada numa equipe existente."""
        TeamService._assert_open_for_registration(team.hackathon)

        if team.leader_id == user.id:
            raise ValidationError("Você já é o líder desta equipe.")

        if Team.objects.filter(hackathon=team.hackathon, members=user).exists():
            raise ValidationError("Você já faz parte de uma equipe neste hackathon.")

        if TeamJoinRequest.objects.filter(
            team=team, user=user, status=TeamJoinRequest.Status.PENDING
        ).exists():
            raise ValidationError("Você já possui uma solicitação pendente para esta equipe.")

        join_request = TeamJoinRequest.objects.create(team=team, user=user)
        send_global_notification(
            f"{user.username} solicitou entrada na equipe '{team.name}'."
        )
        return join_request

    @staticmethod
    @transaction.atomic
    def respond_to_request(join_request, approve):
        """Líder aprova ou rejeita uma solicitação pendente."""
        if join_request.status != TeamJoinRequest.Status.PENDING:
            raise ValidationError("Esta solicitação já foi respondida.")

        if not approve:
            join_request.status = TeamJoinRequest.Status.REJECTED
            join_request.save(update_fields=['status', 'updated_at'])
            return join_request

        # Aprovação: revalida as regras antes de efetivar a entrada.
        TeamService.join_team(join_request.team, join_request.user)
        join_request.status = TeamJoinRequest.Status.APPROVED
        join_request.save(update_fields=['status', 'updated_at'])
        send_global_notification(
            f"{join_request.user.username} entrou na equipe '{join_request.team.name}'."
        )
        return join_request

    @staticmethod
    @transaction.atomic
    def update_team(team, name):
        """Edição de configurações básicas do time pelo líder."""
        team.name = name
        team.save(update_fields=['name'])
        return team

    @staticmethod
    @transaction.atomic
    def leave_team(team, user):
        """Membro sai da equipe. O líder não pode sair (deve desfazer o time)."""
        if team.leader_id == user.id:
            raise ValidationError(
                "O líder não pode sair da equipe. Transfira a liderança ou desfaça o time."
            )
        deleted, _ = TeamMember.objects.filter(team=team, user=user).delete()
        if not deleted:
            raise ValidationError("Você não faz parte desta equipe.")
        return True

    @staticmethod
    @transaction.atomic
    def remove_member(team, member_user):
        """Líder remove um membro da equipe."""
        if team.leader_id == member_user.id:
            raise ValidationError("O líder não pode ser removido da própria equipe.")
        deleted, _ = TeamMember.objects.filter(team=team, user=member_user).delete()
        if not deleted:
            raise ValidationError("Este usuário não faz parte da equipe.")
        return True
