# Contexto da Próxima Sessão - Sprint 5

## Resumo da Sprint 4 (Concluída)
Implementamos o sistema de avaliação completo e reforçamos a segurança/privacidade do projeto.

### Backend (Substancial)
1. **App Evaluations:** Novo módulo com modelos `Criterion`, `Evaluation` e `Score`.
2. **Ranking Service:** Lógica de média ponderada que inclui todas as equipes (mesmo as sem submissão).
3. **Judge Access Control:** Jurados agora precisam estar vinculados a um Hackathon para avaliá-lo.
4. **LGPD Compliance:** Fluxo de consentimento no registro e funcionalidade de exclusão de conta.
5. **Validação Estrita:** Bloqueio de avaliações parciais; todos os critérios do evento devem ser pontuados.

### Frontend (Modernização)
1. **Novas Páginas:** `JudgeDashboard`, `EvaluateSubmission` e `Ranking`.
2. **Sistema de Toast:** Context API para notificações globais estilizadas.
3. **Feedback de Erro:** Substituição de alertas nativos por Toasts e tratamento de erros do Axios.
4. **Navegação Condicional:** Botões de "Avaliar" aparecem apenas para jurados autorizados.

---

## Próximos Passos: Sprint 5 (Performance & Polish)

### Objetivos Principais
- **Otimização de Queries:** Resolver problemas de N+1 no ranking e listagem de hackathons usando `select_related` e `prefetch_related`.
- **UX Avançada:** Implementar Skeletons para estados de carregamento e transições de página suaves.
- **Anonimização (LGPD):** Refinar o processo de deleção para garantir que logs não contenham PII (Personally Identifiable Information).
- **Refatoração de Estilos:** Extrair padrões repetitivos do Tailwind para classes customizadas no `App.css`.

### Regras Estabelecidas
1. **Atomicidade:** Manter a regra de 1 commit por task/mudança lógica.
2. **Service Layer:** Proibido colocar lógica de negócio complexa em Views ou Models.
3. **Segurança:** Todo novo endpoint deve considerar se precisa de permissões específicas (Role-Based).
4. **Validation First:** Sempre validar se os dados de entrada satisfazem os critérios do Hackathon (Prazos, Status, Membros).

---

## Comandos Úteis
- Rodar Testes: `cd backend && source venv/bin/activate && python manage.py test`
- Rodar Dev: `npm run dev` (Frontend) e `python manage.py runserver` (Backend)
