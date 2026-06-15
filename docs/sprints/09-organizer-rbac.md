# Sprint 9: O Papel do Organizador e Refinamentos de Acesso

## Objetivo
Expandir o sistema de RBAC (Role-Based Access Control) para suportar a gestão do evento por organizadores.

## Tarefas Propostas

### 1. Gestão de Papéis (RBAC) [CONCLUÍDO]
- [x] **Role ORGANIZER:** Implementar o novo papel `ORGANIZER` no modelo de usuário e sistema de permissões.
- [x] **Permissões do Organizador:** Capacidade de criar hackathons, gerenciar anúncios e atribuir jurados.

### 2. Fluxo do Jurado (UX/Segurança) [CONCLUÍDO]
- [x] **View-Only Submissions:** Refatorar a tela de Submissões para jurados; ocultar botões de submissão e focar em visualização e avaliação.

---

## Diretrizes Técnicas
- **RBAC:** Utilizar as permissões do Django/DRF de forma granular.
- **Service Layer:** Centralizar a atribuição de papéis e criação de eventos em serviços.
