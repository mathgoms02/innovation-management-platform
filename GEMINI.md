# GEMINI.md - Innovation Management Platform

## Project Overview
This project is an **Innovation Management and Hackathon Platform** designed to manage users (Admin, Participant, Judge), teams, project submissions, and evaluations. It follows a decoupled architecture with a Python/Django backend and a React/TypeScript frontend.

### Architecture
- **Backend:** Django 5.0 + Django REST Framework (DRF). Uses `SimpleJWT` for stateless authentication and `django-environ` for configuration.
- **Frontend:** React 19 + TypeScript + Vite. Styled with Tailwind CSS. Uses `Axios` for API communication with a custom interceptor for JWT handling.
- **Database:** PostgreSQL (configured for production), SQLite (currently used for development).
- **Authentication:** JWT-based, with a custom User model supporting roles (ADMIN, PARTICIPANT, JUDGE).

---

## Directory Structure
- `backend/`: Django application.
  - `apps/`: Domain-specific Django apps (e.g., `users`, `hackathons`, `teams`).
  - `core/`: Project configuration (settings, URLs).
- `frontend/`: Vite + React application.
  - `src/features/`: Domain-based logic and components.
  - `src/services/`: API and other shared services.
- `docs/`: Project documentation.
  - `sprints/`: Sprint-by-sprint progress and decisions.
- `instructions/`: Initial project mandates and instructions.

---

## Architecture & Design Decisions

### Backend Service Layer
To maintain clean views and ensure transactional integrity, business logic is encapsulated in `services.py` within each app. All domain actions (e.g., creating teams, joining hackathons) must pass through these services.

### RBAC & Security
- **Roles:** ADMIN, PARTICIPANT, JUDGE.
- **Permissions:** Custom `IsAdminOrReadOnly` for hackathons.
- **Validations:** Business rules like registration deadlines and unique team membership per hackathon are enforced at the service level.

### Frontend Standards
- **TypeScript:** Strict typing is enforced. Use `import type` for interfaces to comply with `verbatimModuleSyntax`.
- **State Management:** Use `AuthContext` for user session and `services/` for API abstractions.
- **UI Patterns:** 
  - **Auth Screens:** Modern dual-pane layout (Form + Visual Hero).
  - **Main App:** Sidebar-based navigation for all authenticated routes.
  - **Components:** Modular structure with dedicated components for Sidebar, Cards, and Inputs using Tailwind CSS custom classes (`btn-primary`, `card`, etc.).

---

## Roadmap Status
- **Sprint 1 (Foundation):** Completed. Auth (JWT), CustomUser, and basic UI.
- **Sprint 2 (Domain Core):** Completed. Hackathons, Teams, RBAC, and Service Layer.
- **Sprint 3 (Submissions):** Completed. Project uploads and deadline validation.
- **Sprint 4 (Evaluation):** Next. Focus on judge scoring and ranking logic.

---

## Building and Running

### Backend
1. **Navigate to backend:** `cd backend`
2. **Create/Activate Virtual Env:** `python3 -m venv venv && source venv/bin/activate`
3. **Install dependencies:** `pip install -r requirements.txt`
4. **Environment Variables:** Create a `.env` file in `backend/` based on `backend/.env` template.
5. **Run Migrations:** `python manage.py migrate`
6. **Start Server:** `python manage.py runserver`

### Frontend
1. **Navigate to frontend:** `cd frontend`
2. **Install dependencies:** `npm install`
3. **Environment Variables:** Create a `.env` file in `frontend/` with `VITE_API_URL`.
4. **Start Dev Server:** `npm run dev`

---

## Development Conventions

### Git Workflow
- **Branching Strategy:** Use dedicated branches for each sprint (e.g., `sprint-01`, `sprint-02`).
- **Conventional Commits:** Use standard prefixes (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
- **Atomic Commits:** Commit by individual task or logical change. Avoid large, monolithic commits.
- **Commit Only:** The agent must only perform `git commit`. **NEVER** perform `git push`.
- **User Permission:** Always suggest a commit message and wait for explicit permission before committing.

### Backend (Django)
- **Domain-Based Structure:** Keep business logic in `apps/`.
- **Service Layer:** Prefer placing complex logic in `services.py` within apps rather than in `views.py`.
- **Clean Code:** Follow PEP 8 and use explicit type hints where possible.
- **Custom User:** Always use the `users.User` model.

### Frontend (React)
- **Feature-Based Structure:** Organize code by feature under `src/features/`.
- **TypeScript:** Use strict typing. Avoid `any`.
- **Tailwind CSS:** Use Tailwind for all styling.
- **Services:** Centralize API calls in `src/services/api.ts`.

### Documentation
- All major decisions and sprint progress must be documented in `docs/sprints/`.
