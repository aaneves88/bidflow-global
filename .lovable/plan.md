
## Objetivo

1. Dar aos e-mails de auth a cara da Orca (orquinha + paleta oceânica + tipografia do app), não só uma cor cyan no botão.
2. Montar a infra de **app emails** (e-mails transacionais do produto: proposta enviada/visualizada/aceita/assinada, boas-vindas pós-confirmação etc.).

---

## Parte 1 — Identidade visual nos e-mails de auth

### O que muda nos 6 templates (`supabase/functions/_shared/email-templates/*.tsx`)

**Header com a orquinha + wordmark**
- Subir o `orca-mark.png` (mascote) para o bucket `email-assets` via `supabase--storage_upload` e usar a URL pública no `<Img>` do topo de cada template.
- Header: orquinha 56×56 px centralizada + wordmark "Orca" logo abaixo (cyan #06B6D4, tracking apertado), com uma faixa fininha cyan→mint embaixo (gradient via `background-image` inline, compatível com clientes de e-mail).

**Paleta oceânica completa** (hoje só o botão usa cyan)
- `--ocean-deep` #0F172A → headings + footer dark
- `--ocean-cyan` #06B6D4 → links, botão, wordmark
- `--ocean-mint` #F0FDFA → fundo de seção destaque (caixa com o CTA)
- `--slate-text` #475569 → corpo
- `--slate-muted` #94A3B8 → footer

**Estrutura nova de cada e-mail**
1. Header (orquinha + wordmark + faixa gradiente)
2. Heading (Inter/system-ui bold, #0F172A)
3. Parágrafo de corpo
4. **Caixa mint** com o botão CTA dentro (dá respiro e destaque, vira "card de ação")
5. Texto de fallback ("Se o botão não funcionar, copie este link:") com a URL em monospace
6. Divider sutil
7. Footer com mini-orquinha + "Orca · CRM de propostas" + link para `orca-mento.app` + linha legal

**Tom pt-BR refinado por template** (mantendo o que já existe, só polindo)
- `signup`: "Bem-vinda à Orca 🐋" → "Sua conta está quase pronta" + microcopy explicando o que vem depois (criar 1ª proposta).
- `recovery`: tom calmo, "Recebemos um pedido para redefinir sua senha".
- `magic-link`: "Seu link de acesso à Orca".
- `invite`: "Você foi convidado para a Orca" + nome de quem convidou se disponível.
- `email-change`: mostra de/para com destaque visual.
- `reauthentication`: código em caixa grande monospace centralizada com letter-spacing.

**Constantes compartilhadas**
- Extrair os style objects repetidos para um `_shared/email-templates/_styles.ts` (main, container, header, brand, h1, text, link, button, ctaBox, footer, footerLink, divider) para não duplicar em 6 arquivos e garantir consistência.

### Assets
- Bucket `email-assets` (público) — criar se não existir
- Upload de `src/assets/brand/orca-mark.png` como `email-assets/orca-mark.png`
- Upload de uma versão menor (mini, ~24px) para o footer — mesmo arquivo serve, controla por width

### Deploy
- `deploy_edge_functions(["auth-email-hook"])` após editar os templates

---

## Parte 2 — App Emails (transacionais do produto)

### Setup
1. `email_domain--scaffold_transactional_email` → cria `send-transactional-email`, `handle-email-unsubscribe`, `handle-email-suppression`, registry e templates de exemplo.
2. Apagar/substituir os templates de exemplo pelos nossos.

### Templates a criar em `supabase/functions/_shared/transactional-email-templates/`

Todos usando os mesmos `_styles.ts` dos auth emails (mesma identidade visual orquinha + oceano).

| Template | Quando dispara | Destinatário |
|---|---|---|
| `welcome.tsx` | Após `signup` confirmado (trigger via DB on `auth.users` email_confirmed_at) | Novo usuário |
| `proposal-sent.tsx` | Usuário clica "Enviar proposta" e gera link público | Cliente da proposta |
| `proposal-viewed.tsx` | 1ª visualização pública registrada em `proposal_views` | Dono da proposta |
| `proposal-accepted.tsx` | Cliente clica "Aceitar" no link público | Dono da proposta |
| `proposal-signed.tsx` | Cliente conclui assinatura | Dono + cópia para cliente |
| `proposal-rejected.tsx` | Cliente recusa | Dono da proposta |

Cada template tem: header orquinha, preview text útil, dados dinâmicos (nome da proposta, valor BRL formatado, nome do cliente, link para abrir no app/público), CTA na caixa mint, footer padrão. Sem upsell/marketing.

### Wiring dos triggers
- **welcome**: novo edge function `on-user-confirmed` (DB webhook em `auth.users` UPDATE quando `email_confirmed_at` passa de null→valor) → invoca `send-transactional-email`.
- **proposal-sent**: chamar `supabase.functions.invoke('send-transactional-email', ...)` no `ProposalView.tsx` quando o usuário gerar/copiar o link público (ou novo botão "Enviar por e-mail ao cliente").
- **proposal-viewed / accepted / signed / rejected**: já temos hooks/RPC nesses pontos (`useProposalViews`, `PublicProposal.tsx`). Adicionar a chamada de envio no servidor (edge function existente ou trigger DB → função) para garantir que dispara mesmo se o cliente fechar o navegador.

Todos usam `idempotencyKey` derivada de `proposal_id + evento` para não duplicar.

### Página pública de unsubscribe
- Rota `/email/unsubscribe` (path exato vem do scaffold) que lê `?token=`, chama `handle-email-unsubscribe`, mostra estados confirm/sucesso/inválido com a identidade Orca.

---

## Versionamento e docs (conforme regra de releases)

- Bump `package.json` → `0.5.0`
- `docs/releases/v0.5.0-emails.md` documentando: rebrand auth emails + app emails + lista de eventos transacionais
- Atualizar `docs/ROADMAP.md` marcando Onda 5 (e-mails) como concluída
- Atualizar `docs/marketing/features-list.md` adicionando "Notificações automáticas por e-mail"

---

## Detalhes técnicos

- React Email components 0.0.22 (compatível com edge runtime)
- Imagens em e-mail via `<Img>` com `width`/`height` explícitos (Outlook precisa)
- Cores inline em HSL convertidas para HEX (clientes de e-mail antigos não suportam HSL)
- `Body` background sempre `#ffffff` (regra do guia)
- Não adicionar link de unsubscribe nos templates — o sistema acrescenta no app emails; auth emails não levam unsubscribe
- Valores monetários formatados em pt-BR (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`) dentro do template antes de renderizar

---

## Ordem de execução

1. Criar `_styles.ts` compartilhado
2. Reescrever os 6 templates de auth com nova identidade + upload da orquinha pro bucket
3. Deploy `auth-email-hook`
4. Rodar `scaffold_transactional_email`
5. Criar os 6 templates de app emails + registry
6. Wirar triggers (welcome via DB webhook, proposal-* via edge/server)
7. Criar página `/email/unsubscribe`
8. Deploy de tudo
9. Bump versão + release notes + roadmap

Após aprovado, executo na sequência e te mostro previews antes de fechar.
