# Sprint 11: Production Readiness (Segurança, Arquitetura e Deploy)

## Objetivo
Levar a plataforma do estado "funcional em dev" para "implantável em produção", priorizando segurança, reprodutibilidade de infraestrutura e fechamento de lacunas funcionais do produto.

## Estado Atual (baseline)
- Domínio completo: evento → equipes → submissão → avaliação ponderada → ranking.
- Service Layer sólido em `evaluations`, `submissions`, `teams`, `monitoring`.
- RBAC (4 papéis) com ownership por objeto, auditoria automática (`AuditMixin`), LGPD (anonimização), structlog.
- Backend com 32 testes; frontend sem testes.

> **Atualização pós Sprint 10.5:** parte do hardening foi antecipada. Já resolvidos:
> escalonamento de privilégio no cadastro (auto-registro travado em `PARTICIPANT`),
> refresh de token JWT + tratamento de 401 no frontend, ownership de
> `Announcement`/`Criterion` e cockpit do Organizador (`/manage`). Os itens abaixo
> que permanecem abertos seguem como escopo desta sprint.

## Gaps Críticos Identificados
| # | Gap | Severidade |
|---|-----|-----------|
| 1 | WebSocket sem autenticação (`accept()` sem checar usuário; grupo global único) | 🔴 Crítico |
| 2 | Sem `MEDIA_URL`/`MEDIA_ROOT` apesar de `ImageField` (avatar) | 🔴 Crítico |
| 3 | SQLite em uso; incompatível com múltiplos workers + Channels/Redis | 🔴 Crítico |
| 4 | Sem headers de segurança (SSL redirect, HSTS, cookies secure) | 🔴 Crítico |
| 5 | Sem throttling em login/registro (brute-force) | 🟠 Alto |
| 6 | Sem Docker, CI/CD, `.env.example`, servidor ASGI de produção, estáticos | 🟠 Alto |
| 7 | Service Layer ausente em `users` e `hackathons` (viola padrão obrigatório) | 🟡 Médio |
| 8 | Zero testes no frontend; sem reset de senha / verificação de e-mail | 🟡 Médio |

---

## Tarefas

### Fase A — Hardening de Segurança (bloqueante)
- [x] **Autenticar WebSocket via JWT** — middleware de Channels que valida o token (query string `?token=`), popula `scope["user"]` e rejeita conexão anônima.
- [x] **Headers de segurança condicionais a `DEBUG`** — `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_PROXY_SSL_HEADER`.
- [ ] **Throttling DRF** (`ScopedRateThrottle`) em login e registro.
- [ ] **Validação de upload** (tipo/tamanho/extensão) para avatar.
- [ ] **Notificações por usuário** — migrar do grupo global único para grupos `notifications_{user_id}`.

### Fase B — Lacunas Funcionais do Produto
- [ ] Configurar MEDIA (object storage / `django-storages` em produção).
- [ ] Reset e troca de senha + verificação de e-mail (`EMAIL_BACKEND` via env).
- [ ] Fechar escopo da Sprint 10 (dinâmica de equipes / descoberta).

### Fase C — Arquitetura & Qualidade
- [ ] Extrair lógica de `users` e `hackathons` para `services.py`.
- [ ] Testes no frontend (Vitest + Testing Library): Auth/Notification contexts e fluxos de submissão/avaliação.
- [ ] Error Boundary + refresh-token interceptor em `services/api.ts`.

### Fase D — Infraestrutura & Deploy
- [ ] Migrar para PostgreSQL (env-driven via `dj-database-url`); Redis gerenciado.
- [ ] `Dockerfile` (ASGI: Uvicorn/Gunicorn + Daphne) + `docker-compose` (web, db, redis, frontend).
- [ ] `.env.example` documentado.
- [ ] CI (GitHub Actions): lint + `manage.py test` + `npm run build` + smoke test.
- [ ] Servir estáticos (whitenoise/CDN) + `collectstatic`; healthcheck `/api/monitoring/health/` no orquestrador.

### Fase E — Pós-Deploy
- [ ] Centralizar logs JSON num agregador; alertas sobre audit trail; backup de DB.

---

## Sequência
Fases **A** e **D** são os bloqueadores reais de deploy e podem andar em paralelo; **B** e **C** refinam antes do go-live; **E** é contínuo.
