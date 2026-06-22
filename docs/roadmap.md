# Roadmap Master - Plataforma de Gestão de Hackathons

## Visão Geral
Este documento contém o planejamento estratégico completo do projeto, servindo como a "Fonte da Verdade" para o desenvolvimento incremental através das Sprints.

## Arquitetura Macro
- **Frontend:** React (SPA) + Tailwind CSS + Vite + Recharts.
- **Backend:** Django + Django REST Framework + Django Channels (WebSockets).
- **Auth:** JWT (SimpleJWT) com Roles (Admin, Organizer, Participant, Judge).
- **Observabilidade:** Structured Logs + Audit Trail + Health Checks.

---

## Cronograma de Sprints

### Sprint 1: Fundação & Identidade (Concluída)
- **Status:** Setup inicial, CustomUser e infraestrutura base.

### Sprint 2: O Domínio Central (Concluída)
- **Status:** Modelagem de Hackathons e Equipes.

### Sprint 3: O Fluxo de Submissão (Concluída)
- **Status:** Entrega de projetos e validação de regras de negócio.

### Sprint 4: Avaliação & Cálculo (Concluída)
- **Status:** Painel do Jurado e lógica de ranking ponderado.

### Sprint 5: Performance & Refatoração (Concluída)
- **Status:** Otimização de queries (N+1) e feedback visual (Skeletons/Toasts).

### Sprint 6: Observabilidade & Engajamento (Concluída)
- **Status:** Logs estruturados, Auditoria e notificações em Tempo Real (WebSockets).

### Sprint 7: UX Base, Settings e Retenção (Concluída)
- **Objetivo:** Login automático no cadastro, página de Settings (CSS Grid) e segurança LGPD.

### Sprint 8: Dashboard Dinâmica & Dados Reais (Concluída)
- **Objetivo:** Substituir mocks por métricas reais, gráficos dinâmicos e sistema de anúncios.

### Sprint 9: O Papel do Organizador e Refinamentos (Concluída)
- **Objetivo:** Expandir RBAC para suportar o papel de `ORGANIZER`.

### Sprint 10: Dinâmica de Equipes e Descoberta (Concluída)
- **Objetivo:** Busca autocomplete de hackathons, regra de liderança única por evento, fluxo de solicitação de entrada com aprovação do líder, dashboard de equipes e edição pelo líder.

### Sprint 10.5: Hardening, Cockpit do Organizador e Refino de UI (Concluída)
- **Objetivo:** Sprint intermediária de auditoria — correção de escalonamento de privilégio no cadastro, refresh de token JWT, ownership de anúncios/critérios, página `/manage` (criar evento, critérios, jurados, anúncios), `AppLayout` compartilhado e polimento visual cyberpunk.

### Sprint 11: Production Readiness (A Iniciar)
- **Objetivo:** Levar a plataforma a "implantável em produção": PostgreSQL/Redis gerenciados, Docker/CI-CD, MEDIA/storage, throttling, notificações por usuário, testes de frontend e demais itens de `docs/sprints/11-production-readiness.md`.
