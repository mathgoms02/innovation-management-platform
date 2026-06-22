# Frontend — Innovation Management Platform

SPA em **React 19 + TypeScript + Vite** com Tailwind CSS, tema cyberpunk dark.

## Comandos

- `npm install` — instala dependências
- `npm run dev` — servidor de desenvolvimento (Vite, porta padrão 5173)
- `npm run build` — `tsc -b` + `vite build` (erros de tipo quebram o build)
- `npm run lint` — ESLint

Variáveis de ambiente (opcionais): `VITE_API_URL` (default `http://localhost:8000/api`)
e `VITE_WS_URL` (default `ws://localhost:8000/ws/notifications/`).

## Estrutura

- `src/components/` — UI compartilhada. Destaque para **`AppLayout`** (sidebar
  sensível ao papel + topbar com busca de hackathons, notificações e menu de
  usuário). Envolva novas telas em `<AppLayout>` em vez de recriar o cabeçalho.
  Também: `Toast`, `Skeleton`.
- `src/features/` — lógica de domínio e Context API (`auth/AuthContext`,
  `auth/NotificationContext`, `submissions/`).
- `src/services/` — camada de API por domínio (`hackathon`, `team`, `submission`,
  `evaluation`, `monitoring`, `user`) + `api.ts` (Axios com injeção de JWT e
  interceptor de refresh de token em respostas 401).
- `src/pages/` — telas de rota: `Login`, `Register`, `Dashboard`, `Hackathons`,
  `Teams`, `Submissions`, `Manage` (cockpit do Organizador), `Ranking`,
  `JudgeDashboard`, `EvaluateSubmission`, `Settings`.

## Convenções

- **CSS Grid** para layouts complexos (dashboards, cockpit, settings).
- `import type` para interfaces TypeScript (Vite `verbatimModuleSyntax`).
- Tema cyberpunk: fundo `#0b0c10`, acentos Cyan `#00f0ff` e Magenta `#ff007a`;
  use `btn-primary`/`btn-secondary`, bordas neon em foco e a classe `cyber-grid`
  (aplicada pelo `AppLayout`).
- Validar permissões, status do evento e associação do usuário **no frontend e
  na API** antes de qualquer CREATE/UPDATE/DELETE.
