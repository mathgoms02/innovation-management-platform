# Innovation Management Platform

Uma plataforma moderna para gestão de Hackathons, times e submissões de projetos.

## 🚀 Tecnologias

- **Backend:** Django 5.0 + Django REST Framework (DRF)
  - Autenticação: SimpleJWT
  - Arquitetura: Service Layer & Domain-Based Structure
- **Frontend:** React 19 + TypeScript + Vite
  - Estilização: Tailwind CSS + Custom CSS Variables
  - Estado: Context API (Auth)

## 🎨 Identidade Visual

A plataforma utiliza um tema **Cyberpunk/Modern Dark** baseado em:
- **Background Principal:** `#0b0c10`
- **Cores de Destaque:** Cyan (`#00f0ff`) e Magenta (`#ff007a`)
- **Estilo:** Bordas arredondadas, transições suaves e tipografia futurista.

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
- [x] **Sprint 5:** Performance & Otimização
- [ ] **Sprint 6:** Observabilidade & Engajamento
