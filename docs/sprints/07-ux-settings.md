# Sprint 7: UX Base, Settings e Retenção

## Objetivo
Eliminar atritos na experiência do usuário e centralizar o gerenciamento de perfil.

## Tarefas Propostas

### 1. Autenticação & Cadastro (Bugfix)
- [ ] **Login Automático:** Corrigir o fluxo de registro para que o usuário seja autenticado e redirecionado automaticamente após o cadastro bem-sucedido.

### 2. Interface & Notificações (Frontend)
- [ ] **Dropdown de Notificações:** Implementar menu suspenso no ícone de sino com *empty state* elegante e opção "Limpar Notificações".
- [ ] **Menu de Usuário:** Tornar o avatar/iniciais no header clicável, abrindo menu suspenso para acesso a Settings e Logout.

### 3. Módulo de Configurações (Fullstack)
- [ ] **Página de Settings:** Criar layout utilizando **CSS Grid** (Seções: Perfil, Segurança, Preferências).
- [ ] **Gestão de Perfil:** Implementar edição de Nome, Bio e upload de foto de perfil (com fallback para iniciais).
- [ ] **Segurança & LGPD:** Mover `DELETE_ACCOUNT` para Settings. Adicionar modal de confirmação com digitação obrigatória de "deletar_{username}".

---

## Diretrizes Técnicas
- **CSS Grid:** Obrigatório para a estrutura da página de Settings.
- **Estética:** Manter Cyberpunk Minimalista (Cyan/Magenta).
- **Service Layer:** Toda lógica de alteração de perfil e deleção deve residir em `services.py`.
