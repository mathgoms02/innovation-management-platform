# Sprint 2: O Domínio Central (Hackathons e Equipes)

## Objetivo
Implementar a gestão de Hackathons e o fluxo de formação de equipes.

## Tarefas Planejadas
- [x] Modelagem do Hackathon (Backend)
- [x] CRUD de Hackathons (Admin Only)
- [x] Modelagem de Equipes (Teams)
- [x] Fluxo de Inscrição em Hackathons
- [x] Listagem de Hackathons no Frontend

## Decisões Arquiteturais
1.  **RBAC (Role-Based Access Control):** Garantir que apenas usuários com `role=ADMIN` possam criar e editar Hackathons.
2.  **Service Layer:** Iniciar o uso de serviços no Django para gerenciar a lógica de inscrição em times.
