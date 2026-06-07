# Roadmap Master - Plataforma de Gestão de Hackathons

## Visão Geral
Este documento contém o planejamento estratégico completo do projeto, servindo como a "Fonte da Verdade" para o desenvolvimento incremental através das Sprints.

## Arquitetura Macro
- **Frontend:** React (SPA) + Tailwind CSS + Vite.
- **Backend:** Django + Django REST Framework (API Stateless).
- **Auth:** JWT (SimpleJWT) com Roles (Admin, Participant, Judge).
- **Banco de Dados:** PostgreSQL (Produção/Dev final).

---

## Cronograma de Sprints

### Sprint 1: Fundação & Identidade (Concluída - Setup Inicial)
- **Objetivo:** Setup base e infraestrutura de Auth.
- **Status:** Estrutura criada, CustomUser implementado. Pendente: Endpoints de Login/Register (serão movidos para a próxima fase).

### Sprint 2: O Domínio Central (Hackathons e Equipes)
- **Objetivo:** Gestão de Eventos e formação de times.
- **Conceitos:** Modelagem Relacional, RBAC (Role-Based Access Control).
- **Tarefas:**
    - Modelar Hackathons e Teams.
    - CRUD de Hackathons (Admin).
    - Fluxo de entrada em Equipes.

### Sprint 3: O Fluxo de Submissão (Projetos)
- **Objetivo:** Entrega dos projetos pelas equipes.
- **Conceitos:** Domain-Driven Design (Aggregates), Cloud Storage.
- **Tarefas:**
    - Modelar Submissões.
    - Validação de prazos e regras de negócio.
    - Upload de materiais do projeto.

### Sprint 4: Avaliação & Cálculo (Jurados e Ranking)
- **Objetivo:** Notas e geração de resultados.
- **Conceitos:** Service Layer, Query Optimization (Aggregates), Transações ACID.
- **Tarefas:**
    - Painel do Jurado (Atribuição de notas).
    - Lógica de cálculo de ranking por pesos.
    - Endpoint de classificação final.

### Sprint 5: Performance, Refatoração & UX
- **Objetivo:** Polimento e otimização técnica.
- **Conceitos:** N+1 Query solving, UX/UI Advanced (Skeletons, Toasts).
- **Tarefas:**
    - Auditoria de performance (select_related/prefetch_related).
    - Paginação e filtros globais.
    - Refatoração de UI para feedback visual completo.

---

## Próximos Passos (Contexto para Branch `sprint-02`)
1. **Finalizar Auth:** Implementar Serializers/Views de Login e Registro no Django (que ficaram pendentes na S1).
2. **Frontend Auth:** Criar as telas de Login e Registro e integrar com o Interceptor.
3. **Modelagem de Hackathons:** Iniciar o domínio de eventos.
