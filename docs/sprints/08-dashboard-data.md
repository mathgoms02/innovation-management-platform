# Sprint 8: Dashboard Dinâmica & Dados Reais

## Objetivo
Substituir todos os dados estáticos (mocks) da Dashboard por métricas reais calculadas pelo backend em tempo real.

## Tarefas Propostas

### 1. API de Estatísticas (Backend)
- [ ] **Service de Métricas:** Criar um serviço centralizado para calcular:
    - Total de Hackathons Ativos.
    - Número de equipes que o usuário participa.
    - Contagem de notificações não lidas.
    - XP Total (baseado em submissões e avaliações).
- [ ] **Endpoint `/api/monitoring/stats/`:** Disponibilizar esses dados para o frontend.

### 2. Gráficos com Dados Reais (Fullstack)
- [ ] **Métricas de Performance:** Implementar lógica para buscar o histórico de avaliações do usuário/equipe e popular o gráfico de barras.
- [ ] **Agregações DRF:** Utilizar `Count` e `Avg` para gerar os dados do gráfico de forma eficiente.

### 3. Sistema de Anúncios (Backend)
- [ ] **Modelo Announcement:** Criar modelo para "Cluster News" (Título, Conteúdo, Tipo, Data).
- [ ] **CRUD Admin:** Permitir que administradores publiquem notícias que aparecerão na dashboard.

### 4. Integração Frontend
- [ ] **Data Fetching:** Conectar os componentes de Stats, Chart e News aos novos endpoints.
- [ ] **Auto-refresh:** Garantir que a dashboard se atualize quando novos dados (como avaliações) chegarem via WebSocket.

---

## Diretrizes Técnicas
- **Performance:** Utilizar cache (se necessário) para métricas pesadas.
- **WebSocket Integration:** Sincronizar o estado da Dashboard com os eventos do `NotificationProvider`.
