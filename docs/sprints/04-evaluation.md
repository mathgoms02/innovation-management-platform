# Sprint 4: Avaliação & Cálculo (Jurados e Ranking)

## Objetivo
Implementar o sistema de avaliação de projetos por jurados, incluindo a atribuição de notas baseada em critérios e a geração automática do ranking final.

## Entregáveis
- [x] Modelagem de Avaliações e Critérios (Backend)
- [x] Painel do Jurado (Frontend)
- [x] Lógica de cálculo de ranking com pesos (Backend Service)
- [x] Endpoint de classificação final (Dashboard/Public)
- [x] Integração de permissões para o papel de `JUDGE`

## Decisões Arquiteturais
1.  **Criteria-Based Scoring:** As avaliações não serão uma nota única, mas compostas por múltiplos critérios (ex: Inovação, Viabilidade, Pitch) definidos para o hackathon.
2.  **Service Layer for Ranking:** O cálculo da pontuação final será centralizado em um serviço para garantir consistência e facilitar o uso de pesos diferenciados.
3.  **Judge-Specific Views:** O frontend terá rotas e componentes exclusivos para usuários com a role `JUDGE`.

## Sprint 4 Extension: Polimento & Segurança

### Novas Tasks
- [x] **Vínculo Jurado-Hackathon:** Garantir que jurados só acessem eventos para os quais foram designados.
- [x] **Validação Estrita de Notas:** Impedir submissão de avaliações incompletas (todos os critérios devem ser pontuados).
- [x] **Ranking Inclusivo:** Listar todas as equipes inscritas no ranking, mesmo as sem submissão.
- [x] **LGPD - Consentimento:** Adicionar checkbox de aceite de termos no registro.
- [x] **LGPD - Direito ao Esquecimento:** Implementar funcionalidade de deletar conta.
- [x] **UX - Feedback Global:** Implementar sistema de notificações (Toasts) para erros e sucessos.

### Mudanças Arquiteturais Adicionais
1. **M2M Relationship:** Adicionado campo `judges` no modelo `Hackathon`.
2. **Soft Delete vs Hard Delete:** Avaliar a melhor estratégia para o "Direito ao Esquecimento" (optaremos por Hard Delete dos dados pessoais, mantendo registros anonimizados se necessário, ou deleção em cascata).
3. **Global UI State:** Uso de Context API para gerenciar notificações globais sem dependências pesadas.
