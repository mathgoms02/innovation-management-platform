# Guia de Testes Manuais - Innovation Management Platform

Este guia descreve como testar todas as funcionalidades da plataforma, do backend ao frontend.

## 1. Setup do Ambiente

### Backend
1. Navegue para a pasta `backend`.
2. Ative o ambiente virtual: `source venv/bin/activate`.
3. Certifique-se de que as migrações foram aplicadas: `python manage.py migrate`.
4. Crie um superusuário para acessar o painel Admin: `python manage.py createsuperuser` (use `admin` / `admin123`).
5. Inicie o servidor: `python manage.py runserver`.

### Frontend
1. Navegue para a pasta `frontend`.
2. Instale as dependências: `npm install`.
3. Inicie o servidor de desenvolvimento: `npm run dev`.
4. Acesse `http://localhost:5173` (ou a porta indicada).

---

## 2. Fluxo de Teste: Administrador

1. **Login:** Acesse a página de login e entre com a conta de superusuário.
2. **Criar Hackathon:**
   - Atualmente, a criação é feita via Django Admin (`/admin/`) ou via API.
   - Recomendo criar um Hackathon via Django Admin para definir datas e critérios.
3. **Definir Critérios:** No Django Admin, adicione `Criteria` ao seu Hackathon (ex: "Inovação", "Qualidade de Código").
4. **Monitoramento:** Acesse o Dashboard e verifique se as "Recent Activity" mostram suas ações recentes (Logs de Auditoria).

---

## 3. Fluxo de Teste: Participante

1. **Registro:** Saia da conta admin e registre um novo usuário com o papel **PARTICIPANT**.
2. **Dashboard:** Verifique se as estatísticas iniciais aparecem corretamente.
3. **Hackathons:** Vá para a lista de Hackathons, use os **Filtros** para buscar o evento criado.
4. **Criar Equipe:** Entre nos detalhes do Hackathon e crie uma nova equipe.
5. **Submissão:** Dentro da sua equipe, realize a submissão do projeto (URL do repositório, vídeo, etc.).
6. **Ranking:** Verifique se sua equipe aparece no Ranking (ainda sem nota).

---

## 4. Fluxo de Teste: Jurado

1. **Registro:** Registre um novo usuário com o papel **JUDGE**.
2. **Atribuição (Admin):** Volte ao Django Admin e adicione esse novo Jurado ao campo `judges` do Hackathon.
3. **Avaliação:** 
   - Logado como Jurado, vá em "Hackathons".
   - Clique em "Avaliar" no evento correspondente.
   - No Dashboard do Jurado, selecione a submissão da equipe criada anteriormente.
   - Atribua notas a todos os critérios e envie.
4. **Notificação:** Verifique se apareceu um Toast de notificação informando sobre a nova avaliação.

---

## 5. Fluxo de Encerramento

1. **Ranking Final:** Verifique se o Ranking agora mostra a nota calculada da equipe.
2. **Exportação:** Na página de Ranking, clique em "Download Report" para baixar o CSV.
3. **Exclusão de Conta (LGPD):** No Dashboard, clique em "Delete Account" e confirme. Verifique se você foi deslogado e se o usuário foi anonimizado no banco de dados.

---

## 6. Comandos de Diagnóstico (Dica)

- **Logs de Auditoria:** `GET /api/monitoring/logs/` (Apenas Admin).
- **Health Check:** `GET /api/monitoring/health/`.
- **Smoke Test Automático:** `python smoke_test.py` dentro da pasta `backend`.
