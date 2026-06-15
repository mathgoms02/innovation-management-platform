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
- `frontend/src/features/`: Lógica de domínio (Auth, Submissões, Notificações).
- `frontend/src/services/`: Camada de API, incluindo o `monitoringService`.
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
- **Permissions:** A classe `IsAdminOrOrganizerOrReadOnly` garante que um `ORGANIZER` possa criar hackathons e publicar anúncios, mas só possa editar os eventos criados por ele mesmo (verificado pelo campo `Hackathon.organizer`).
- **Judge assignment:** Acesso ao painel de avaliação restrito a jurados (`JUDGE`) vinculados especificamente ao hackathon em questão. O painel de submissão do participante é bloqueado (View-Only) para `JUDGE` e `ORGANIZER`.
- **LGPD Deletion:** O método `delete` no `UserDetailView` não remove o registro físico, mas sim anonimiza PII (Personal Identifiable Information), alterando e-mail, nomes e ofuscando a senha.

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
