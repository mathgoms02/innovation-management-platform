# Guia de Testes Manuais - Innovation Management Platform

Este guia descreve como testar todas as funcionalidades da plataforma, do backend ao frontend.

## 1. Setup do Ambiente

### Backend
1. Navegue para a pasta `backend`.
2. Crie/ative o ambiente virtual: `python3 -m venv venv && source venv/bin/activate`.
3. Instale as dependências: `pip install -r requirements.txt`.
4. Garanta um `backend/.env` com `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.
5. Aplique as migrações: `python manage.py migrate`.
6. Crie um superusuário (ADMIN): `python manage.py createsuperuser`.
7. Inicie o servidor: `python manage.py runserver`.

### Frontend
1. Navegue para a pasta `frontend`.
2. Instale as dependências: `npm install`.
3. Inicie o servidor de desenvolvimento: `npm run dev`.
4. Acesse `http://localhost:5173` (ou a porta indicada).

> **Papéis:** o auto-cadastro cria sempre um `PARTICIPANT`. Para ter um `ORGANIZER`
> ou `JUDGE`, promova o usuário pelo Django Admin (`/admin/`) ou via shell antes
> dos fluxos abaixo.

---

## 2. Fluxo de Teste: Administrador / Organizador (Cockpit `/manage`)

1. **Login:** entre com a conta ADMIN (ou um usuário promovido a ORGANIZER).
2. **Acessar o Cockpit:** no menu lateral, clique em **Gerenciar** (visível apenas para ADMIN/ORGANIZER) ou acesse `/manage`.
3. **Criar Hackathon:** preencha título, descrição, datas e prazo de inscrição no painel "Novo_Evento". O ORGANIZER vira automaticamente o dono do evento.
4. **Editar Detalhes:** selecione o evento na lista e ajuste status (`DRAFT`→`PUBLISHED`→`ONGOING`→`COMPLETED`), regras e datas na aba **Detalhes**.
5. **Definir Critérios:** na aba **Critérios**, adicione critérios com seus pesos (ex.: "Inovação" peso 2, "Qualidade de Código" peso 1) e remova se necessário.
6. **Designar Jurados:** na aba **Jurados**, selecione os usuários com papel `JUDGE` e salve.
7. **Publicar Anúncio:** use o painel "Publicar_Anúncio" — o anúncio aparece na Dashboard e dispara uma notificação em tempo real para os usuários conectados.
8. **Monitoramento (Admin):** na Dashboard, verifique se "Recent_Activity" mostra os logs de auditoria das suas ações.

---

## 3. Fluxo de Teste: Participante

1. **Registro:** saia da conta admin e registre um novo usuário (será `PARTICIPANT`; a tela não oferece outros papéis).
2. **Dashboard:** verifique se as estatísticas iniciais aparecem corretamente.
3. **Descoberta:** use a busca no topo (autocomplete de hackathons) ou a página **Hackathons** com filtros.
4. **Criar Equipe:** em **Equipes**, crie um time para um hackathon aberto (`PUBLISHED`/`ONGOING`). Você só pode liderar um time por evento.
5. **Solicitar Entrada:** com um segundo participante, busque um time e clique em **Solicitar_Entrada**. O líder vê a solicitação no painel do time e pode **aprovar/rejeitar**.
6. **Submissão:** em **Submissões**, selecione a equipe e envie o projeto (descrição + URL do repositório; apresentação opcional). Só é permitido com o evento `ONGOING` e dentro do prazo.
7. **Ranking:** confira se a equipe aparece no Ranking (ainda sem nota).

---

## 4. Fluxo de Teste: Jurado

1. **Preparação:** promova um usuário a `JUDGE` (Django Admin) e designe-o ao hackathon pelo Cockpit (Seção 2, passo 6).
2. **Avaliação:**
   - Logado como Jurado, vá em **Hackathons** e clique em **Avaliar** no evento.
   - No painel do Jurado, selecione a submissão da equipe.
   - Atribua notas de **0 a 10** a todos os critérios e envie.
3. **View-Only:** confirme que o Jurado (e o Organizador) veem as Submissões em modo somente-leitura.
4. **Notificação:** verifique o Toast informando a nova avaliação.

---

## 5. Fluxo de Encerramento

1. **Ranking Final:** verifique se o Ranking mostra a nota ponderada calculada da equipe.
2. **Exportação:** na página de Ranking, clique em "Download_Report" para baixar o CSV.
3. **Exclusão de Conta (LGPD):** em **Settings → Delete_Account**, confirme digitando `deletar_<username>`. Verifique que você foi deslogado e que o usuário foi anonimizado no banco.

---

## 6. Comandos de Diagnóstico (Dica)

- **Logs de Auditoria:** `GET /api/monitoring/logs/` (apenas Admin).
- **Health Check:** `GET /api/monitoring/health/`.
- **Usuários por papel:** `GET /api/users/?role=JUDGE` (Admin/Organizador).
- **Smoke Test Automático:** `python smoke_test.py` dentro da pasta `backend`.
- **Sessão JWT:** o frontend renova o access token automaticamente em respostas 401; se a renovação falhar, você é redirecionado ao login.
