# Relatório de Correções de Bugs — Plano, Assinatura, Popup de Upgrade e Cadastro

**Data:** Agosto de 2026
**Versão:** v0.6.x
**Conta de teste:** shannasloboda@gmail.com

---

## Contexto

Rodada de correção de bugs de plano/assinatura, popup de upgrade e cadastro, reportados por teste real (conta shannasloboda@gmail.com). Os sintomas incluíam: usuários novos aparecendo como Premium sem assinar, divergência de plano entre telas, sentinel `-1` (ilimitado) vazando para a UI e para a lógica, popup de upgrade disparando no momento errado (ao cadastrar cliente, antes de criar proposta), formulário de cadastro resetando ao trocar de aba do navegador, e features duplicadas no card do plano Gratuito.

---

## Descoberta importante

A produção (orca-mento.app) estava desatualizada — várias correções existiam no código/preview mas não tinham sido publicadas. Vários bugs "-1" e "Premium sem assinar" vistos ao vivo eram versão antiga publicada. **É obrigatório publicar após esta rodada.**

---

## Estado da conta de teste

`shannasloboda@gmail.com` está no plano **Gratuito** no banco (`price 0.00`, `status active`). O "Premium" que aparecia na tela era resolução de plano no frontend (corrigida) + versão publicada antiga. Nenhum reset de dados foi necessário.

---

## Bugs corrigidos

### 1. Usuário novo virava Premium sem assinar

- **Sintoma:** Ao criar uma conta nova, o usuário já aparecia como Premium, sem nunca ter assinado um plano pago.
- **Causa-raiz:** A lógica de resolução de plano tratava valores nulos/vazios como Premium e/ou a coluna `is_starter` estava invertida, fazendo o plano padrão resolver como Premium.
- **Correção:** Plano padrão garantido como Gratuito (`is_starter = true` para Gratuito). O trigger `handle_new_user` cria o profile no plano correto. `useSubscription()` só considera o plano como pago quando existe um `user_plans` ativo com `price > 0`.
- **Estado:** Já correto — `is_starter` = Gratuito, `handle_new_user` e `useSubscription` validados.

### 2. Telas divergiam no plano (Minha conta Premium × Propostas com limite free)

- **Sintoma:** A tela "Minha conta" mostrava Premium enquanto a tela "Propostas" aplicava limite de plano gratuito — cada tela resolvia o plano de um jeito diferente.
- **Causa-raiz:** Existiam múltiplos pontos de resolução de plano (`useCurrentPlan`, `usePlanLimits`, lógica inline), cada um com sua própria interpretação.
- **Correção:** Criada fonte única `useSubscription()` (`src/hooks/useSubscription.ts`) que lê a coluna `plan` em `profiles` e retorna o plano atual + limites. Minha conta, Propostas, Planos e a trava de limite passaram a consumir esse mesmo hook. `useCurrentPlan`/`usePlanLimits` foram removidos.
- **Arquivos:** `src/hooks/useSubscription.ts`, `src/lib/planLimits.ts`, `src/pages/account/AccountPage.tsx`, `src/pages/proposals/Proposals.tsx`, `src/pages/proposals/ProposalForm.tsx`, `src/pages/proposals/ProposalView.tsx`, `src/pages/Pricing.tsx`, `src/pages/Dashboard.tsx`, `src/pages/MobilePaywall.tsx`, `src/pages/clients/Clients.tsx`, `src/pages/settings/SettingsPage.tsx`, `src/components/UsageIndicator.tsx`.

### 3. Sentinel `-1`/`null` = ilimitado vazando para tela e lógica

- **Sintoma:** A tela mostrava "0 de -1 propostas usadas" e cards exibindo "-1 proposta"/"-1 cliente". A lógica de trava comparava `-1` literalmente.
- **Causa-raiz:** O valor `-1` (e `null`) significa "ilimitado", mas estava sendo exibido e comparado de forma literal, sem interpretação semântica.
- **Correção:**
  1. Helper `isUnlimited(limit)` => `limit === -1 || limit == null`.
  2. Exibição: quando `isUnlimited`, mostra "Ilimitado" (nunca "-1"); a barra de progresso de uso fica oculta quando ilimitado.
  3. Lógica da trava: `atingiuLimite = !isUnlimited(limite) && usadas >= limite`. Quando ilimitado, nunca considera limite atingido.
- **Arquivos:** `src/lib/planLimits.ts`, `src/hooks/useSubscription.ts`, `src/components/UsageIndicator.tsx`.

### 4. Popup "orçamento grátis" disparava ao cadastrar cliente (antes de criar proposta)

- **Sintoma:** O popup "Você usou seu orçamento grátis" aparecia logo após cadastrar o primeiro **cliente**, antes de criar qualquer orçamento/proposta.
- **Causa-raiz:** As travas usavam `canCreate*` sem esperar os dados da assinatura carregarem (`isReady`), fazendo o popup disparar prematuramente com estado incompleto.
- **Correção:** Travas agora usam `isReady && proposalLimitReached` (nunca dispara enquanto carrega nem em plano ilimitado), aplicado ao botão "Novo" e ao "Duplicar". Cadastro de cliente foi isolado do popup de propostas — cadastrar cliente nunca abre o modal de propostas; usa sua própria trava de clientes (`isReady && clientLimitReached`).
- **Arquivos:** `src/pages/proposals/Proposals.tsx`, `src/pages/clients/Clients.tsx`.

### 5. Formulário do wizard resetava ao trocar de aba

- **Sintoma:** No cadastro multi-step de cliente (onboarding), ao trocar de aba do navegador e voltar, o formulário voltava para o passo anterior e perdia o progresso.
- **Causa-raiz:** O Supabase dispara `onAuthStateChange` com `TOKEN_REFRESHED`/`USER_UPDATED` ao reganhar foco da aba, e algum efeito reiniciava o passo do wizard ou refazia fetch que remontava o form.
- **Correção:**
  1. No listener `onAuthStateChange` (AuthContext), `TOKEN_REFRESHED` e `USER_UPDATED` são ignorados por completo (sem `setState`). Só `SIGNED_IN` com `user.id` diferente e `SIGNED_OUT` alteram o estado de auth. Quando o `user.id` não muda, nada é re-setado.
  2. O passo atual e os campos do wizard de onboarding ficam em estado local persistido em `sessionStorage` — nenhum efeito depende do objeto de sessão. O rascunho é limpo ao concluir. Trocar de aba e voltar mantém passo e dados mesmo se houver remount.
- **Arquivos:** `src/contexts/AuthContext.tsx`, `src/pages/Onboarding.tsx`.

### 6. Card do plano Gratuito com features duplicadas

- **Sintoma:** No card do plano Gratutivo da tela de Planos, "1 proposta" e "5 clientes" apareciam duplicados.
- **Causa-raiz:** A duplicação podia vir da coluna `features` (jsonb) do plano no banco ou de renderização repetida no frontend.
- **Correção:** Adicionado dedupe defensivo baseado em `Set` em `Pricing.tsx` ao renderizar o array de `features`. A coluna `features` do plano Gratutivo no banco já estava correta (`1 proposta, 5 clientes, Link público, Painel básico`) — não foi necessário alterar o banco.
- **Arquivos:** `src/pages/Pricing.tsx`.
- **Banco:** sem alteração.

---

## Roteiro de QA (rodar em produção após publicar)

1. **Criar conta nova** → cai em Gratuito, mostra "0 de 1 proposta" (nunca "-1"), sem popup.
2. **Cadastrar 1º cliente** → **NÃO** dispara popup de propostas.
3. **Durante cadastro de cliente, trocar de aba e voltar** → mantém passo e dados.
4. **Criar 1ª proposta** → ok.
5. **Tentar criar 2ª proposta** → aí sim aparece o upgrade.
6. **Minha conta** → mostra Gratuito (não Premium) para quem não assinou.
7. **Tela de Planos** → Gratuito lista exatamente: *1 proposta, 5 clientes, Link público, Painel básico*; Premium mostra "Ilimitado" (não "-1").

---

## Observações finais

- **Publicação é obrigatória** após esta rodada — vários bugs vistos em produção eram versão antiga publicada.
- **Nenhum reset de dados** foi necessário; a conta de teste já estava correta no banco.
- **Banco de dados:** sem alterações nesta rodada (correções foram todas no frontend/resolução de plano).
