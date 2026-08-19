# Acompanhamento de usuários no painel admin

Hoje a aba **Usuários** mostra nome, e-mail, papéis, plano e data de cadastro. A aba **Visão geral** mostra números agregados (funil de ativação, ativos 7/30 dias), mas não dá para olhar usuário por usuário e responder "esse aqui já criou proposta?" ou "quando ele entrou pela última vez?".

A proposta é enriquecer a própria aba **Usuários** com essas informações, em vez de criar mais uma tela.

## O que a tela passa a mostrar

Para cada usuário, além do que já existe:

- **Último acesso** — data do último login (ex.: "há 3 dias"), ou "nunca acessou".
- **Propostas** — quantas criou (0, 1, 12...) e a data da última.
- **Clientes** — quantos cadastrou.
- **Situação** — um selo simples derivado dos dados:
  - `Nunca acessou` — conta criada, nenhum login além do cadastro
  - `Sem proposta` — acessa mas nunca criou proposta
  - `Ativo` — criou proposta e acessou nos últimos 30 dias
  - `Inativo` — já criou proposta, mas sem acesso há mais de 30 dias

Complementos na mesma aba:

- Campo de busca por nome/e-mail.
- Filtro rápido por situação (todos / nunca acessou / sem proposta / ativo / inativo).
- Ordenação por último acesso e por número de propostas.
- Quatro contadores no topo: total, nunca acessaram, sem proposta, ativos 30 dias.

As ações que já existem (tornar admin, conceder Premium) continuam iguais.

## Detalhes técnicos

- Nova função no banco `get_admin_user_activity()` (`SECURITY DEFINER`, `search_path = public`), protegida por `has_role(auth.uid(), 'admin')` e com `REVOKE` de `anon` — mesmo padrão de `get_admin_activation_stats()`.
  Retorna por usuário: `id, full_name, email, created_at, last_sign_in_at, proposals_count, last_proposal_at, clients_count`.
  `last_sign_in_at` vem de `auth.users` (somente leitura, sem trigger nem alteração no schema `auth`).
- `src/hooks/useAdminUsers.ts`: buscar a nova RPC e mesclar com os dados atuais de perfis/papéis/planos, expondo os campos novos em `AdminUser`.
- `src/pages/admin/AdminUsers.tsx`: colunas novas, busca, filtro por situação, ordenação e cartões de contagem. Selo e "há X dias" derivados no front.
- Traduções novas em `src/i18n/locales/pt-BR/admin.json` e `src/i18n/locales/en/admin.json` (`users.activity.*`).
- Sem mudança de schema (só uma função nova); nenhum fluxo existente é alterado.
