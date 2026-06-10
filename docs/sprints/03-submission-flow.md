# Sprint 3: O Fluxo de Submissão (Projetos)

## Objetivo
Implementar o sistema de entrega de projetos pelas equipes, com validações de prazo e regras de negócio.

## Entregáveis
- [x] Modelagem de Submissões (Backend)
- [x] Service Layer para validação de prazos e membros da equipe
- [x] API de Submissões
- [x] Interface de Submissão (Frontend)
- [x] Integração no Dashboard

## Decisões Arquiteturais
1.  **Dedicated App:** Criado o app `apps/submissions` para separar a lógica de entrega da lógica de formação de equipes.
2.  **One-to-One Submission:** Cada equipe possui apenas uma submissão ativa por hackathon. Atualizações sobrescrevem a entrega anterior (mantendo o histórico via `updated_at`).
3.  **Validation at Service Layer:** Toda a lógica de verificação de status do hackathon e prazos foi centralizada no `SubmissionService`.

## Tecnologias/Componentes
- Model `Submission`: Armazena URLs de repositório e apresentação.
- Componente `SubmissionForm`: UI moderna com feedback visual de sucesso/erro.
- Página `Submissions`: Central de controle para o participante gerenciar suas entregas.
