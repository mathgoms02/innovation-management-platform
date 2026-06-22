# Sprint 10: Dinâmica de Equipes e Descoberta de Eventos

## Objetivo
Melhorar a jornada do Participante na formação de times e busca por hackathons.

## Tarefas Realizadas

### 1. Descoberta & Busca [CONCLUÍDO]
- [x] **Autocomplete Search:** A busca do header da Home (Dashboard) foi refatorada para exibir um dropdown com resultados de hackathons conforme a digitação (filtro debounced/client-side sobre os eventos já carregados), navegando ao ranking do evento selecionado.

### 2. Gestão de Equipes (Participantes) [CONCLUÍDO]
- [x] **Regras de Criação:** O `TeamService.create_team` agora impede explicitamente que um participante lidere mais de uma equipe por hackathon (além da regra de não fazer parte de duas equipes no mesmo evento).
- [x] **Fluxo de Solicitação:** Novo modelo `TeamJoinRequest` (PENDING/APPROVED/REJECTED) com `UniqueConstraint` para evitar pedidos pendentes duplicados. Endpoints no `TeamViewSet`: `request-join` (participante solicita), `requests` (líder lista pendentes) e `requests/<id>/respond` (líder aprova/rejeita). A aprovação revalida as regras antes de efetivar a entrada e dispara notificação.
- [x] **Dashboard de Equipes:** Nova página `/teams` com busca server-side (`?search=`) e visualização. É **view-only** para `JUDGE` e `ORGANIZER` (sem criação, solicitação ou edição).
- [x] **Edição de Equipe:** O líder pode editar o nome do time. Edição/exclusão são protegidas pela permissão `IsTeamLeaderOrReadOnly` (apenas líder ou ADMIN).

---

## Diretrizes Técnicas Seguidas
- **CSS Grid:** Layout do dashboard de equipes (`/teams`) construído com CSS Grid (lista + painel de detalhe).
- **Service Layer:** Toda a lógica de negócio (regras de criação, solicitação, aprovação/rejeição, edição) vive em `apps/teams/services.py`; o ViewSet permanece fino.
- **Autocomplete performático:** O autocomplete filtra no cliente sobre a lista de hackathons já carregada, sem requisições adicionais por tecla.
- **Validação dupla:** Permissões e regras de associação são validadas tanto na API (permissões DRF + service) quanto no frontend (checks de `role` e de associação).

## Cobertura de Testes
- `apps/teams/tests.py` cobre: bloqueio de líder duplicado, edição restrita ao líder (403 para não-líder), fluxo completo de solicitação (approve/reject) e busca por nome. Suíte backend: 28 testes passando.
