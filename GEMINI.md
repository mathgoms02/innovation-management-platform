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
- **Judge assignment:** Acesso a submissões restrito a jurados vinculados ao hackathon.
- **LGPD Deletion:** O método `delete` no `UserDetailView` não remove o registro, mas anonimiza PII (Personal Identifiable Information).

---

## Development Standards
1. **Commits:** Mensagens semânticas (`feat:`, `fix:`, `docs:`).
2. **Logic Placement:** Regras de negócio complexas devem residir em `services.py`.
3. **Frontend Imports:** Utilizar `import type` para tipos TypeScript e caminhos relativos consistentes.
4. **Validation:** Sempre validar critérios, prazos e permissões antes de persistir dados.
