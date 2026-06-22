# Innovation Management Platform

Uma plataforma moderna e escalável para gestão de Hackathons, times e submissões de projetos, focada em observabilidade e experiência em tempo real.

## 🚀 Tecnologias

- **Backend:** Django 5.0 + Django REST Framework (DRF)
  - **Autenticação:** SimpleJWT com Auditoria de Login e Role-Based Access Control (Admin, Organizer, Participant, Judge).
  - **Real-time:** Django Channels + Daphne + Redis.
  - **Observabilidade:** Structured Logging (structlog) + Audit Trail + Health Checks.
- **Frontend:** React 19 + TypeScript + Vite
  - **Estilização:** Tailwind CSS.
  - **Gráficos:** Recharts para métricas de performance.
  - **Comunicação:** Axios + WebSocket para notificações instantâneas.

## ✨ Funcionalidades Principais

- **Cockpit do Organizador (`/manage`):** Interface para ADMIN/ORGANIZER criar e editar hackathons, gerenciar critérios e pesos, designar jurados e publicar anúncios — tudo pela UI (sem depender do Django Admin).
- **Sistema de Equipes:** Formação de times com regra de uma liderança por evento, fluxo de **solicitação de entrada** com aprovação do líder, edição pelo líder e submissão de projetos com controle de prazos.
- **Painel do Jurado:** Interface dedicada para avaliação baseada em critérios ponderados (escala 0–10).
- **Ranking Dinâmico:** Cálculo automático de notas e exportação de resultados em CSV.
- **Navegação Unificada:** `AppLayout` compartilhado (sidebar sensível ao papel + topbar com busca de hackathons, notificações e menu de usuário) em todas as telas.
- **Observabilidade:** Trilha de auditoria completa para ações administrativas e de jurados.
- **Notificações:** Feedback em tempo real via WebSockets para eventos críticos.
- **Segurança & Privacidade (LGPD):** Auto-cadastro restrito ao papel `PARTICIPANT`, refresh automático de token JWT no frontend, e anonimização de dados na exclusão de conta.

## 🎨 Identidade Visual

Tema **Cyberpunk/Modern Dark**:
- **Background:** `#0b0c10`
- **Destaques:** Cyan (`#00f0ff`) e Magenta (`#ff007a`)
- **UI:** Bordas arredondadas, Skeletons para carregamento e Toasts para notificações.

## 🛠️ Como Executar

### Backend
1. `cd backend`
2. `python3 -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `python manage.py migrate`
5. `python manage.py runserver`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📈 Roadmap

- [x] **Sprint 1:** Fundação (Auth & Custom User)
- [x] **Sprint 2:** Domínio Core (Hackathons & Teams)
- [x] **Sprint 3:** Submissões (Upload de Projetos)
- [x] **Sprint 4:** Avaliação (Painel do Jurado & Ranking)
- [x] **Sprint 5:** Performance & Refatoração (UX/N+1)
- [x] **Sprint 6:** Observabilidade & Engajamento (Logs/Audit/WebSockets)
- [x] **Sprint 7:** UX Base, Settings e Retenção
- [x] **Sprint 8:** Dashboard Dinâmica & Dados Reais
- [x] **Sprint 9:** O Papel do Organizador e Refinamentos
- [x] **Sprint 10:** Dinâmica de Equipes e Descoberta (busca, solicitação de entrada, gestão de times)
- [x] **Sprint 10.5:** Hardening de Segurança, Cockpit do Organizador e Refino de UI
- [ ] **Sprint 11:** Production Readiness (Segurança, Arquitetura e Deploy)
