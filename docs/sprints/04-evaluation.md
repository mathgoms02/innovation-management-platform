# Sprint 4: Avaliação & Cálculo (Jurados e Ranking)

## Objetivo
Implementar o sistema de avaliação de projetos por jurados, incluindo a atribuição de notas baseada em critérios e a geração automática do ranking final.

## Entregáveis
- [x] Modelagem de Avaliações e Critérios (Backend)
- [x] Painel do Jurado (Frontend)
- [x] Lógica de cálculo de ranking com pesos (Backend Service)
- [x] Endpoint de classificação final (Dashboard/Public)
- [x] Integração de permissões para o papel de `JUDGE`

## Decisões Arquiteturais
1.  **Criteria-Based Scoring:** As avaliações não serão uma nota única, mas compostas por múltiplos critérios (ex: Inovação, Viabilidade, Pitch) definidos para o hackathon.
2.  **Service Layer for Ranking:** O cálculo da pontuação final será centralizado em um serviço para garantir consistência e facilitar o uso de pesos diferenciados.
3.  **Judge-Specific Views:** O frontend terá rotas e componentes exclusivos para usuários com a role `JUDGE`.

## Tecnologias/Componentes
- Model `Evaluation`: Relaciona `Submission`, `User` (Judge) e as notas por critério.
- Model `Criterion`: Define os critérios de avaliação e seus pesos por hackathon.
- Componente `JudgeDashboard`: Visualização das submissões pendentes de avaliação.
- Componente `EvaluationForm`: Interface para o jurado inserir as notas.
