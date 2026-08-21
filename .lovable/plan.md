# Landing pages por nicho (SEO)

## Resposta curta
Sim, compensa — mas não como 15 páginas quase iguais. O Google trata página de nicho sem conteúdo próprio como "doorway page" e simplesmente não ranqueia. O que funciona é um número menor de páginas com conteúdo real do nicho: modelo de orçamento específico, itens típicos, faixas de preço, erros comuns daquele serviço.

Melhor ainda: o termo que o eletricista busca não é "software de proposta" — é "modelo de orçamento de serviços elétricos". A intenção é pegar o modelo. A página entrega o modelo e converte no fim. É a mesma lógica da `/modelos-de-proposta-comercial`, que já funciona.

## Escopo proposto (fase 1: 5 nichos)
Começar com 5, medir 30-45 dias no Search Console, e só então expandir. Nichos com maior volume/intenção comercial:

1. Eletricista — `/modelo-de-orcamento/eletricista`
2. Fotógrafo — `/modelo-de-orcamento/fotografo`
3. Ar-condicionado (instalação e manutenção) — `/modelo-de-orcamento/ar-condicionado`
4. Decoração de casamento / festas — `/modelo-de-orcamento/decoracao-de-casamento`
5. Prestador de serviços em geral (guarda-chuva) — `/modelo-de-orcamento/prestador-de-servicos`

Ficam para a fase 2 (após dados): manutenção predial, pintor, marceneiro, jardinagem, personal trainer, vendedor autônomo, obras/reforma.

## O que cada página tem (conteúdo próprio, não template vazio)
- H1 com o termo exato do nicho ("Modelo de orçamento para eletricista")
- Texto curto de intenção: o que não pode faltar num orçamento daquele serviço
- **Modelo pronto copiável**, com itens reais do nicho (ex.: ponto de tomada, quadro de distribuição, ART, deslocamento) — este é o ativo que gera link e compartilhamento
- Tabela "o que costuma ser cobrado à parte" (material, deslocamento, hora extra, taxa de visita)
- 4-5 perguntas frequentes específicas do nicho, com FAQPage JSON-LD
- CTA para criar a proposta no Orca já com o modelo do nicho
- Links cruzados entre nichos e para `/modelos-de-proposta-comercial` (vira hub)

## Detalhes técnicos
- Uma rota dinâmica `/modelo-de-orcamento/:nicho` renderizada por um componente único (`src/pages/NicheTemplate.tsx`), alimentado por `src/content/niches/*.ts` — um arquivo de conteúdo por nicho. Slug desconhecido → 404.
- `/modelos-de-proposta-comercial` ganha uma seção "Modelos por profissão" linkando os 5 nichos (hub → spokes).
- `Seo.tsx` já cobre title/description/canonical/OG; cada nicho define os seus.
- JSON-LD `FAQPage` por página, mesmo padrão já usado em `ProposalTemplates.tsx`.
- `scripts/generate-sitemap.ts` passa a gerar as entradas de nicho a partir do mesmo índice de conteúdo (sem lista duplicada).
- Sem mudança de backend, sem i18n (páginas são pt-BR, mercado Brasil) — seguindo o padrão já adotado em `ProposalTemplates.tsx`.
- Opcional (recomendado): ao clicar no CTA, levar para `/register?modelo=eletricista` e apenas registrar a origem; pré-preencher a proposta com o modelo fica para uma etapa seguinte.

## Como medir
Depois de publicar: Search Console por página (impressões/cliques por 30 dias) e o evento de cadastro com UTM/`referrer` que já existe em `attributionSync.ts`. Nicho que não sair do zero em 45 dias não vira mais 10 páginas iguais.
