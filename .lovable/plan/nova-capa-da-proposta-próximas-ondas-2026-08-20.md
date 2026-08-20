# Nova capa da proposta + próximas ondas

## 1. Capa do PDF (prioridade imediata)

A capa atual é branca, com logo pequeno no topo e muito espaço vazio no meio. Vira uma **capa cheia colorida**, em faixas de largura total:

```text
┌──────────────────────────────┐
│  [faixa cor da marca]        │
│   logo + nome da empresa     │
│   tagline                    │
│                              │
│   PROPOSTA COMERCIAL         │
│   Título da proposta         │  <- tipografia grande, alinhada à esquerda
│                              │
├──────────────────────────────┤
│  [faixa clara / cartão]      │
│  Preparada para: Cliente     │
│  Válida até | Data | Valor   │
├──────────────────────────────┤
│  faixa de acento fina        │
└──────────────────────────────┘
```

Detalhes:
- Fundo ocupa a página inteira na cor secundária da marca (padrão `#0F172A`), sem moldura branca.
- Bloco superior: logo do freelancer (ou marca Orca no plano gratuito), nome e tagline.
- Bloco central: rótulo "Proposta comercial" em maiúsculas espaçadas + título em tipografia grande alinhada à esquerda, ocupando o espaço que hoje fica vazio.
- Rodapé da capa: cartão com cliente, data de emissão, validade e **valor total** em destaque na cor de acento — resolve o "espaço mal usado" trazendo informação útil.
- Cores sempre vindas do branding do usuário (primária / secundária / acento), com contraste automático de texto claro sobre fundo escuro.
- No plano gratuito a capa continua exibindo a marca Orca; nos planos pagos, só a marca do usuário.

Técnico: reescrita de `buildCoverCanvas` em `src/lib/proposalPdf.ts`, capa renderizada em página inteira (sem margens), novos rótulos em `labels` e traduções em `pt-BR/proposals.json` e `en/proposals.json`.

## 2. O que mais precisamos — ondas seguintes

Você marcou as quatro frentes; ordem sugerida por impacto:

### Onda A — Lançamento nas lojas (bloqueia receita mobile)
- Compra in-app obrigatória na Play/App Store: fechar o fluxo RevenueCat (produtos, entitlement, sincronização com `user_plans`) e esconder o link Stripe dentro do app nativo.
- Assets e ficha das lojas: ícone, screenshots, descrição PT/EN, política de privacidade e exclusão de conta (já existem, revisar).
- Build assinado Android + checklist de review.

### Onda B — Conversão e receita
- Plano anual (R$ 239,90) ativo no app e no checkout, com selo "2 meses grátis".
- Cupom pré-preenchido no checkout para quem vem de indicação/parceiro.
- Página de preços e paywall com prova social e comparativo enxuto.

### Onda C — Qualidade do produto
- Nova capa (item 1) + revisão das seções "Por que eu" e PIX no PDF.
- Pré-visualização da proposta antes de enviar.
- Polimento do editor de itens no mobile.

### Onda D — Retenção
- Resumo semanal por e-mail: propostas abertas, vencendo e taxa de aceite.
- Notificação quando o cliente abre a proposta (hoje só há registro).
- Lembrete automático de follow-up para propostas paradas.

Começo pela capa; as ondas seguem em releases separadas com doc em `docs/releases/`.
