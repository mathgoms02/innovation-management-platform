# Sprint 6: Observabilidade & Engajamento (Roadmap)

## Objetivo
Elevar o nível da plataforma de um MVP robusto para um sistema pronto para escala, focando em feedback em tempo real, visualização de dados e auditoria.

## Tarefas Propostas

### 1. Observabilidade & Auditoria (Backend) [CONCLUÍDO]
- [x] **Logs Estruturados:** Implementar `django-structlog` para rastrear ações críticas (criação de hackathons, alterações de notas).
- [x] **Trilha de Auditoria:** Criar um modelo `AuditLog` para registrar quem alterou o quê e quando, especialmente para ações de Admin e Jurados.
- [x] **Health Checks:** Adicionar endpoints de `/health/` para monitoramento de infraestrutura.

### 2. Experiência em Tempo Real (Fullstack)
- **Notificações via WebSocket:** Usar Django Channels para notificar participantes instantaneamente quando uma submissão for avaliada ou um anúncio for feito.
- **Feed de Atividade:** Transformar a seção "Recent Activity" do Dashboard em um stream dinâmico de eventos do cluster.

### 3. Dashboards Avançados (Frontend)
- **Visualização de Dados:** Integrar `Recharts` para exibir gráficos de desempenho das equipes por critério.
- **Analytics para Admin:** Painel com estatísticas de engajamento, média de notas por jurado e distribuição de submissões.

### 4. Melhorias de Qualidade de Vida (UX)
- **Filtros Avançados:** Busca e filtragem por tags, tecnologias e status em todas as listagens.
- **Exportação de Dados:** Permitir que Admins exportem o ranking final em CSV/PDF para cerimônias de premiação.

---

## Próximos Passos Técnicos
1. Configurar Redis para suporte a WebSockets (Channels).
2. Definir esquema de logs estruturados.
3. Escolher biblioteca de gráficos para o frontend.
