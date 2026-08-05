# Correções de plano, limites e cadastro — 2026-08-05

Documento de rastreio dos 6 bugs corrigidos, do reset da conta de teste e do roteiro de QA.

---

## BUG 1 — Usuário novo virava Premium sem assinar (crítico, vazamento de receita)

**Sintoma:** toda conta recém-criada aparecia como Premium.

**Causa-raiz:** o trigger `handle_new_user()` concede automaticamente o plano marcado como
`is_starter = true`. No banco, **o plano marcado como starter era o Premium** (`plans.is_starter`),
então todo signup ganhava Premium de cortesia. Além disso, o front resolvia "sem plano" de forma
inconsistente.

**Correção aplicada:**
- Dados: `plans.is_starter = false` no Premium e `true` no Gratuito — novo usuário agora recebe Gratuito.
- Código: `useSubscription()` só considera plano pago quando existe `user_plans` com
  `status = 'active'`, não expirado **e** `price > 0`. Qualquer outro caso (nulo, vazio, expirado,
  cancelado) resolve como **Gratuito**. Nenhuma cortesia automática.

**Arquivos:** `src/hooks/useSubscription.ts` + update de dados na tabela `plans`.

---

## BUG 2 — Fonte única da verdade do plano

**Sintoma:** "Minha conta" mostrava Premium enquanto "Propostas" aplicava limite de Gratuito.

**Causa-raiz:** havia três resoluções paralelas de plano — `useCurrentPlan()` (só `status=active`),
`useSubscription()` (active/past_due/cancelled) e `usePlanLimits()` (com quota livre hardcoded de
3 propostas, sem relação com o banco).

**Correção aplicada:** `useSubscription()` virou a **única** fonte: resolve o plano uma vez, calcula
uso (propostas/clientes), limites, flags de recurso e travas. `useCurrentPlan.ts` e `usePlanLimits.ts`
foram **removidos**; todas as telas passaram a consumir o hook único.

**Arquivos:**
- criado/reescrito: `src/hooks/useSubscription.ts`
- removidos: `src/hooks/useCurrentPlan.ts`, `src/hooks/usePlanLimits.ts`
- consumidores atualizados: `src/pages/account/AccountPage.tsx`, `src/pages/Pricing.tsx`,
  `src/pages/Dashboard.tsx`, `src/pages/MobilePaywall.tsx`, `src/pages/proposals/Proposals.tsx`,
  `src/pages/proposals/ProposalForm.tsx`, `src/pages/proposals/ProposalView.tsx`,
  `src/pages/clients/Clients.tsx`, `src/pages/settings/SettingsPage.tsx`,
  `src/components/UsageIndicator.tsx`

---

## BUG 3 — Sentinel `-1` (ilimitado) vazando para tela e lógica

**Sintoma:** "0 de -1 propostas usadas", cards com "-1 proposta" / "-1 cliente" e trava disparando
cedo porque `0 >= -1` é verdadeiro.

**Causa-raiz:** o código só tratava `null` como ilimitado; o Premium usa `-1` nas colunas
`max_proposals` / `max_clients`.

**Correção aplicada:** helper `isUnlimited(limit) => limit === -1 || limit == null`, mais
`reachedLimit(used, limit) = !isUnlimited(limit) && used >= limit` e `usagePercent()`.
- Exibição: ilimitado mostra "Ilimitado"/"Ilimitadas", nunca `-1`; barra de progresso é ocultada.
- Lógica: ilimitado nunca atinge limite e nunca abre o popup de upgrade.

**Arquivos:** `src/lib/planLimits.ts` (novo), `src/hooks/useSubscription.ts`,
`src/components/UsageIndicator.tsx`, `src/pages/Pricing.tsx`.

---

## BUG 4 — Popup de upgrade disparando na hora errada

**Sintoma:** "Você usou seu orçamento grátis" aparecia logo após cadastrar o primeiro cliente,
antes de qualquer proposta.

**Causa-raiz:** a trava usava a quota hardcoded de `usePlanLimits` e comparava contra o sentinel;
além disso o efeito em `ProposalForm` rodava antes dos dados carregarem, com valores default.

**Correção aplicada:** o disparo agora usa exclusivamente `proposalLimitReached` (BUG 3) e só depois
que os dados carregaram (`isReady`). Enquanto carrega, `canCreateProposal = true` — nada bloqueia
nem abre popup. Cadastro de cliente usa `clientLimitReached` e nunca aciona o popup de propostas.

**Arquivos:** `src/pages/proposals/ProposalForm.tsx`, `src/pages/proposals/Proposals.tsx`,
`src/pages/clients/Clients.tsx`, `src/hooks/useSubscription.ts`.

---

## BUG 5 — Formulário reseta ao trocar de aba

**Sintoma:** ao sair e voltar para a aba durante o cadastro em etapas, o formulário voltava ao passo
anterior e perdia dados.

**Causa-raiz:** ao reganhar foco, o Supabase dispara `TOKEN_REFRESHED` / `USER_UPDATED`;
o listener em `AuthContext` reexecutava `setUser`/`setLoading`, remontando a árvore e reiniciando o
estado local dos formulários.

**Correção aplicada:** o listener ignora `TOKEN_REFRESHED`, `USER_UPDATED` e `INITIAL_SESSION`
(apenas atualiza a sessão silenciosamente) e só reprocessa quando o **id do usuário realmente muda**
(login/logout). O passo do wizard continua em `useState` local, agora sem remontagem espúria.

**Arquivos:** `src/contexts/AuthContext.tsx`.

---

## BUG 6 — Card do Gratuito com features duplicadas

**Sintoma:** "1 proposta" e "5 clientes" apareciam duas vezes no card do plano Gratuito.

**Causa-raiz:** a tela renderizava as linhas derivadas de `max_proposals`/`max_clients` **e** a lista
`plans.features`, que já continha os mesmos itens.

**Correção aplicada:** as linhas derivadas só são renderizadas quando `features` está vazio.
Lista do Gratuito (vinda do banco): **1 proposta, 5 clientes, Link público, Painel básico**.

**Arquivos:** `src/pages/Pricing.tsx`.

---

## Reset da conta de teste

Não existe conta com o email `ssloboda@gmail.com`. A única conta Sloboda no banco é
**`shannasloboda@gmail.com`** — essa foi a resetada:

- assinatura Premium (concedida sem pagamento) removida de `user_plans`;
- vínculo criado com o plano **Gratuito**, `status = 'active'`, sem `expires_at` e sem qualquer
  identificador de assinatura Stripe.

Verificado: `shannasloboda@gmail.com → Gratuito / active / sem expiração`.

---

## Roteiro de QA

1. **Conta nova cai em Gratuito** — cadastrar um email novo; "Minha conta" deve mostrar *Gratuito* e o
   indicador de uso "0 de 1 propostas usadas". Nenhum popup de upgrade.
2. **Cadastrar cliente não dispara popup** — criar 1 cliente; nenhum popup de proposta deve aparecer.
3. **1ª proposta funciona** — criar uma proposta normalmente até salvar.
4. **2ª proposta dispara upgrade** — clicar em "Nova proposta"; o modal de upgrade deve abrir e o
   indicador mostrar "Você atingiu o limite do seu plano".
5. **Troca de aba preserva o formulário** — no cadastro em etapas de cliente, preencher, ir para outra
   aba por ~1 min e voltar: o passo e os dados permanecem.
6. **Premium não mostra `-1`** — com conta Premium, os textos exibem "Ilimitado"/"Ilimitadas",
   sem barra de progresso e sem popup de upgrade.
