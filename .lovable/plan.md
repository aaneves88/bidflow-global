## Objetivo
1. Adicionar dois campos novos na proposta: **Observações** (texto livre) e **Termos & Condições** (pagamento, prazos, garantias).
2. Refinar o visual da proposta tanto no **link público** quanto no **PDF gerado**.

## 1. Banco de dados
Migration adicionando duas colunas em `public.proposals`:
- `notes text` — observações livres do profissional
- `terms text` — termos e condições

Nenhuma mudança em RLS/grants (colunas herdam políticas existentes).

## 2. Formulário de proposta (`ProposalForm.tsx`)
Adicionar, dentro do card "Detalhes" (ou em um novo card "Observações e termos" depois dos itens):
- Textarea **Observações** (rows=4) — placeholder explicando que aparece no PDF/link
- Textarea **Termos & Condições** (rows=5) — placeholder com exemplos (forma de pagamento, validade, garantias)

Persistir `notes` e `terms` no create/update (atualizar `useProposals.ts` se necessário para incluir os campos no payload e no select).

## 3. Visual da proposta pública (`PublicProposal.tsx`)
Refinamentos:
- **Cabeçalho**: aumentar respiro, alinhar logo + nome com mais elegância, tipografia mais equilibrada
- **Bloco do cliente**: card dedicado em vez de texto solto, com label discreto
- **Tabela de itens**: zebra mais suave, header com cor da marca em opacidade baixa em vez de azul sólido berrante; números tabulares
- **Total**: caixa destacada no canto direito com fundo suave em cor de accent (não só texto verde)
- **Novas seções**: "Observações" e "Termos & Condições" como cards depois dos itens, antes dos botões de ação
- **Rodapé**: linha sutil com nome da empresa + selo "Gerado por CloseFlow" (mantido)
- Espaçamentos consistentes, melhor responsividade mobile

## 4. Visual do PDF (`proposalPdf.ts`)
Refinamentos:
- Cabeçalho com mais respiro entre logo, nome da empresa e título
- Caixa "Cliente" com fundo cinza claro e label em maiúsculas pequenas
- Tabela: linhas alternadas suaves, header com cor primária em tom mais sóbrio, padding maior
- Bloco "Total geral" como caixa destacada (não só texto), alinhada à direita
- Novas seções **Observações** e **Termos & Condições** abaixo da tabela (apenas se preenchidas), com título estilizado e texto justificado
- Quebra de página automática garantida via `autoTable` + checagem de Y antes de cada bloco novo
- Footer com link público em fonte menor e cor neutra

## 5. i18n
Adicionar chaves em `pt-BR` e `en` (namespaces `proposals` e `public`):
- `form.notes`, `form.notesPlaceholder`
- `form.terms`, `form.termsPlaceholder`
- `view.notes`, `view.terms` (ProposalView interno)
- `pdf.notes`, `pdf.terms`
- `notes`, `terms` (public)

## Arquivos afetados
- `supabase/migrations/*` — adicionar `notes` e `terms`
- `src/hooks/useProposals.ts` — incluir campos no payload/select
- `src/pages/proposals/ProposalForm.tsx` — dois novos textareas + estado
- `src/pages/proposals/PublicProposal.tsx` — refinamento visual + render notes/terms
- `src/pages/proposals/ProposalView.tsx` — render notes/terms na visão interna
- `src/lib/proposalPdf.ts` — refinamento visual + render notes/terms
- `src/i18n/locales/{pt-BR,en}/{proposals,public}.json` — novas chaves

## Fora do escopo
- Mudar o tratamento da logo (mantido conforme escolha do usuário)
- Mexer em outras telas além das listadas
