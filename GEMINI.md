# GEMINI.md - Innovation Management Platform

## Project Overview

Plataforma completa para gestão de Hackathons, integrando participantes, jurados e administradores em um ecossistema com feedback em tempo real e auditoria estrita.

### Architecture Highlights

- **Backend:** Django 5.0. Estrutura baseada em `Service Layer` para lógica de negócio e `Mixins` para auditoria automática.
- **Frontend:** React 19 (Vite). Organizado por `features/` com suporte a `Context API` para Auth e Notificações.
- **Real-time:** Integração de WebSockets via Django Channels para notificações instantâneas.
- **Security:** RBAC (Role-Based Access Control) e conformidade com LGPD através de anonimização de dados.

---

## Directory Structure

- `backend/apps/`: Aplicativos de domínio (`users`, `hackathons`, `teams`, `submissions`, `evaluations`, `monitoring`).
- `backend/apps/monitoring/`: Módulo central de saúde, logs de auditoria e lógica de WebSockets.
- `frontend/src/components/`: UI compartilhada, incluindo o `AppLayout` (sidebar + topbar persistentes), `Toast` e `Skeleton`.
- `frontend/src/features/`: Lógica de domínio (Auth, Submissões, Notificações).
- `frontend/src/services/`: Camada de API (`api.ts` com interceptor de refresh de token, mais um módulo por domínio: `hackathon`, `team`, `submission`, `evaluation`, `monitoring`, `user`).
- `frontend/src/pages/`: Telas de rota, incluindo `Manage` (cockpit do Organizador) e `Teams` (dashboard de equipes).
- `docs/sprints/`: Histórico detalhado de decisões e progresso por sprint.

---

## Key Design Decisions

### Observability & Audit

- **Audit Logs:** Todo recurso que herda de `AuditMixin` registra automaticamente ações de CREATE/UPDATE/DELETE.
- **Structured Logs:** Logs em JSON salvos localmente (excluídos do Git) para integração com ferramentas de análise.

### Real-time Experience

- **Notification Engine:** Uso de `InMemoryChannelLayer` para testes e `RedisChannelLayer` para produção.
- **Global Events:** Notificações disparadas via `send_global_notification` em serviços ou views.

### Security & Privacy

- **RBAC (Role-Based Access Control):** Papéis definidos no modelo User (`ADMIN`, `ORGANIZER`, `JUDGE`, `PARTICIPANT`).
- **Self-registration:** O `RegisterSerializer` **não** aceita `role`; todo auto-cadastro é forçado para `PARTICIPANT`. Papéis privilegiados (`JUDGE`/`ORGANIZER`) só são concedidos por Admin/Organizador. A listagem de usuários por papel (`GET /api/users/?role=`) é restrita a Admin/Organizador e alimenta a designação de jurados no cockpit.
- **Permissions:** `IsAdminOrOrganizerOrReadOnly` resolve a posse do objeto via helper `_owns`, que aceita `obj.organizer`, `obj.created_by` (ex.: `Announcement`) ou `obj.hackathon.organizer` (ex.: `Criterion`). `ADMIN` faz bypass. Equipes usam `IsTeamLeaderOrReadOnly` (apenas líder/ADMIN edita ou desfaz).
- **Team membership:** Solicitações de entrada (`TeamJoinRequest`) são aprovadas/rejeitadas pelo líder; o membro pode sair (líder não), e o líder pode remover membros. Regra de uma liderança por hackathon aplicada no `TeamService`.
- **Judge assignment:** Acesso ao painel de avaliação restrito a jurados (`JUDGE`) vinculados especificamente ao hackathon. O painel de submissão do participante é bloqueado (View-Only) para `JUDGE` e `ORGANIZER`.
- **LGPD Deletion:** O método `delete` no `UserDetailView` não remove o registro físico, mas sim anonimiza PII (Personal Identifiable Information), alterando e-mail, nomes e ofuscando a senha. O arquivo de avatar é deletado do storage.
- **Avatar Upload:** Endpoint dedicado `POST/DELETE /api/users/me/avatar/` com validação de tipo (JPEG, PNG, GIF, WebP) e tamanho (máx 5 MB). Arquivos servidos via `MEDIA_URL` em dev; o `UserSerializer` retorna a URL absoluta via `SerializerMethodField`. Upload e remoção registram audit log.
- **JWT no frontend:** `services/api.ts` injeta o access token e possui interceptor de resposta que renova via `/users/token/refresh/` em caso de 401, enfileirando requests concorrentes; ao falhar, encerra a sessão e redireciona ao login.
- **AuthContext `updateUser`:** Além de `login` e `logout`, o contexto expõe `updateUser(Partial<User>)` que mescla dados parciais ao estado do usuário — usado após upload de avatar e edição de perfil para refletir mudanças sem reload.

---

## Development Standards

### Diretrizes de Código & Arquitetura

1. **Commits:** Mensagens semânticas em inglês (`feat:`, `fix:`, `docs:`) e atômicas por funcionalidade ou task completada na sprint.
2. **Backend (Service Layer):** Regras de negócio, criação de dados complexos (ex: RBAC, criação de times) e lógicas de auditoria DEVEM residir exclusivamente nos arquivos `services.py` de cada app. Views e ViewSets devem permanecer "magros" focando apenas em validação de entrada e roteamento.
3. **Frontend (Estrutura):**
   - **CSS Grid:** O uso de **CSS Grid** é OBRIGATÓRIO ao estruturar novos layouts complexos (como páginas de Settings, Dashboards de Equipes, Painéis de Administração). Evite aninhamentos desnecessários de Flexbox quando o Grid for mais semântico para a estrutura da página.
   - **Estética Cyberpunk Minimalista:** Mantenha a consistência visual em todos os novos componentes. O fundo deve permanecer escuro (`#0b0c10` ou variantes), utilizando tons neon **Cyan (`#00f0ff`)** e **Magenta (`#ff007a`)** estrategicamente para feedbacks visuais, botões de ação (ex: `btn-primary`, `btn-secondary`), ícones ativos e bordas em foco.
   - **Imports:** Utilizar a sintaxe `import type` para importar interfaces TypeScript, garantindo o funcionamento correto com o compialador do Vite (`verbatimModuleSyntax`).
4. **Validation First:** Sempre validar na API e no Frontend regras como permissões, status do evento e associação do usuário antes de permitir mutações (CREATE/UPDATE/DELETE).
