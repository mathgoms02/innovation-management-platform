# Sprint 2: O Domínio Central (Hackathons e Equipes)

## Objetivo
Implementar a gestão de Hackathons e o fluxo de formação de equipes.

## Tarefas Planejadas
- [ ] Modelagem do Hackathon (Backend)
- [ ] CRUD de Hackathons (Admin Only)
- [ ] Modelagem de Equipes (Teams)
- [ ] Fluxo de Inscrição em Hackathons
- [ ] Listagem de Hackathons no Frontend

## Decisões Arquiteturais
1.  **RBAC (Role-Based Access Control):** Garantir que apenas usuários com `role=ADMIN` possam criar e editar Hackathons.
2.  **Service Layer:** Iniciar o uso de serviços no Django para gerenciar a lógica de inscrição em times.
