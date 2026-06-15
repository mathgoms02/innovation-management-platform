# Sprint 9: O Papel do Organizador e Refinamentos de Acesso

## Objetivo
Expandir o sistema de RBAC (Role-Based Access Control) para suportar a gestão do evento por organizadores.

## Tarefas Realizadas

### 1. Gestão de Papéis (RBAC) [CONCLUÍDO]
- [x] **Role ORGANIZER:** Adicionado o papel `ORGANIZER` no modelo base `User`.
- [x] **Permissões do Organizador:** Criada a classe de permissão DRF `IsAdminOrOrganizerOrReadOnly`. Organizadores agora podem:
  - Criar Hackathons (e tornam-se automaticamente os donos/organizadores do evento via campo `Hackathon.organizer`).
  - Editar apenas os Hackathons criados por eles.
  - Publicar `Announcements` globais que aparecem na Dashboard.
  - Atribuir jurados e editar critérios.

### 2. Fluxo do Jurado e Organizador (UX/Segurança) [CONCLUÍDO]
- [x] **View-Only Submissions:** A página de "Minhas Submissões" no frontend foi refatorada. Se o usuário for um `JUDGE` ou `ORGANIZER`, o formulário de envio de projetos é bloqueado. Em vez disso, é exibida uma interface *View-Only* orientando o usuário a utilizar a página de Eventos/Painel do Jurado para realizar as avaliações.

---

## Diretrizes Técnicas Seguidas
- **RBAC Granular:** A lógica de validação de propriedade (`has_object_permission`) na criação de Hackathons garante que organizadores não interfiram nos eventos de outros organizadores, mantendo a autonomia.
- **Frontend Role Checks:** Utilização estrita do `useAuth().user.role` para condicionar a renderização de componentes críticos.
