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
| 1 | ~~WebSocket sem autenticação (`accept()` sem checar usuário; grupo global único)~~ | ✅ Resolvido |
| 2 | ~~Sem `MEDIA_URL`/`MEDIA_ROOT` apesar de `ImageField` (avatar)~~ | ✅ Resolvido |
| 3 | ~~SQLite fixo~~ → banco via `DATABASE_URL` (env). Falta subir Postgres gerenciado (Fase D) | 🟢 Parcial |
| 4 | ~~Sem headers de segurança (SSL redirect, HSTS, cookies secure)~~ | ✅ Resolvido |
| 5 | ~~Sem throttling em login/registro (brute-force)~~ | ✅ Resolvido |
| 6 | Sem Docker, CI/CD, `.env.example`, servidor ASGI de produção, estáticos | 🟠 Alto |
| 7 | Service Layer ausente em `users` e `hackathons` (viola padrão obrigatório) | 🟡 Médio |
| 8 | Zero testes no frontend; sem reset de senha / verificação de e-mail | 🟡 Médio |

---

## Tarefas

### Fase A — Hardening de Segurança (bloqueante)
- [x] **Autenticar WebSocket via JWT** — `apps/monitoring/middleware.py::JWTAuthMiddleware` valida o access token da query string (`?token=`), popula `scope["user"]` via SimpleJWT; `NotificationConsumer` recusa conexões anônimas (`close(code=4001)`). `core/asgi.py` usa o middleware no lugar de `AuthMiddlewareStack`. Frontend passa o token na URL do WS. Coberto por testes (`WebSocketTests`).
- [x] **Headers de segurança condicionais a `DEBUG`** — `SECURE_SSL_REDIRECT`, `SECURE_PROXY_SSL_HEADER`, `SECURE_HSTS_SECONDS`/`INCLUDE_SUBDOMAINS`/`PRELOAD`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_CONTENT_TYPE_NOSNIFF`, `CSRF_TRUSTED_ORIGINS` — aplicados apenas quando `DEBUG=False`.
- [x] **Throttling DRF** (`ScopedRateThrottle`) em login (`login`, 10/min) e registro (`register`, 5/min), configurável por env; desativado sob o test runner.
- [x] **Validação de upload** (tipo/tamanho/extensão) para avatar — endpoint dedicado `POST/DELETE /api/users/me/avatar/` com validação de MIME type (JPEG, PNG, GIF, WebP) e tamanho (5 MB). Frontend exibe avatar real na Settings e topbar, com upload, preview e remoção.
- [x] **Notificações por usuário** — `NotificationConsumer` entra nos grupos `notifications_{user_id}` (por usuário) e `notifications_broadcast` (global). `services.send_user_notification(user_id, msg)` mira um usuário; `send_global_notification(msg)` faz broadcast. Notificação de nova avaliação passou a mirar o organizador do hackathon.

### Fase B — Lacunas Funcionais do Produto
- [x] Configurar MEDIA — `MEDIA_URL = '/media/'` e `MEDIA_ROOT = BASE_DIR / 'media'` adicionados ao `settings.py`; `core/urls.py` serve arquivos de media em `DEBUG`. `UserSerializer` retorna URL absoluta via `SerializerMethodField`. Para produção, migrar para object storage / `django-storages`.
- [x] Reset e troca de senha + verificação de e-mail — `EMAIL_BACKEND`/SMTP via env (console por padrão). Endpoints: `POST /api/users/password/reset/`, `password/reset/confirm/`, `password/change/`, `verify-email/`. Campo `User.is_email_verified` + `EmailVerificationTokenGenerator`; reset não revela existência de conta. Coberto por testes (`PasswordFlowTests`, `EmailVerificationTests`).
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
