# Sprint 8: Dashboard Dinâmica & Dados Reais

## Objetivo
Substituir todos os dados estáticos (mocks) da Dashboard por métricas reais calculadas pelo backend em tempo real.

## Tarefas Realizadas

### 1. API de Estatísticas (Backend) [CONCLUÍDO]
- [x] **Service de Métricas:** Criado serviço centralizado em `monitoring/services.py` para calcular Hackathons ativos, times, XP e média de notas.
- [x] **Endpoint `/api/monitoring/stats/`:** Implementado e protegido por autenticação.

### 2. Gráficos com Dados Reais (Fullstack) [CONCLUÍDO]
- [x] **Métricas de Performance:** Lógica implementada para buscar a média de notas por equipe e popular o gráfico dinamicamente.
- [x] **Agregações DRF:** Utilização eficiente de `Avg` e `Count`.

### 3. Sistema de Anúncios (Backend) [CONCLUÍDO]
- [x] **Modelo Announcement:** Criado modelo para notícias do sistema com categorias (INFO, URGENT, etc.).
- [x] **CRUD Admin:** Registrado no Django Admin para publicação dinâmica.

### 4. Integração Frontend [CONCLUÍDO]
- [x] **Data Fetching:** Dashboard refatorada para utilizar `useCallback` e sincronizar todos os dados via `monitoringService`.
- [x] **Auto-refresh:** A dashboard agora se auto-atualiza quando recebe notificações via WebSocket (como novas avaliações).

---

## Diretrizes Técnicas Seguidas
- **Consistência:** Gráfico utiliza o padrão de cores do tema (Cyan/Magenta) baseado na performance.
- **Resiliência:** Tratamento de erros no carregamento para evitar que falhas em um serviço quebrem toda a dashboard.
