# Sprint 1: Fundação & Identidade

## Objetivo
Configurar a base técnica do projeto (Backend e Frontend) e implementar o sistema de autenticação via JWT com suporte a papéis de usuário (Roles).

## Decisões Arquiteturais
1.  **Custom User Model:** Implementação imediata de um modelo de usuário customizado herdando de `AbstractUser` para permitir a inclusão de campos como `role` (Admin, Participante, Jurado) sem migrações complexas no futuro.
2.  **Stateless Auth:** Uso de JWT para garantir que o backend não precise armazenar estados de sessão, facilitando a escalabilidade.
3.  **Environment Variables:** Uso de arquivos `.env` para separar configurações de desenvolvimento de credenciais sensíveis.

## Tecnologias
- Backend: Python 3.12+, Django 5.x, DRF, SimpleJWT.
- Frontend: React 18+, Vite, Tailwind CSS, Axios.
- Banco de Dados: PostgreSQL (Inicialmente usaremos SQLite para setup rápido, migrando para Postgres ainda nesta Sprint).

## Progresso das Tarefas
- [x] Estrutura de Documentação Inicial
- [x] Setup do Ambiente Virtual (venv) e Dependências Backend
- [x] Inicialização do Projeto Django e App 'users'
- [x] Configuração do CustomUser
- [x] Setup do Projeto React com Vite e Tailwind
- [ ] Implementação de Endpoints de Auth (Login/Register/Refresh)
- [x] Configuração do Axios Interceptor no Frontend
