# Dois ajustes: PIX no PDF e blocos de texto

## 1. PIX não aparece no PDF baixado dentro do app

Causa confirmada: existem dois caminhos de PDF no app e só um deles envia o PIX.

- PDF pelo **link público**: monta o código PIX (chave da proposta ou do perfil) e desenha o QR no fim do documento.
- PDF pela **tela da proposta** (o que a usuária usa): chama o gerador **sem** o bloco de PIX. Por isso nunca sai QR ali, tenha a proposta chave própria ou não.

O que muda: a tela da proposta passa a montar o mesmo bloco de PIX do link público —
chave da proposta quando preenchida, senão a chave PIX do perfil; nome do recebedor
vindo da empresa/nome do perfil; valor igual ao total. Continua valendo a regra atual:
só sai QR quando a moeda é BRL e existe alguma chave.

Também vale um aviso discreto no formulário quando não há chave nenhuma (nem na
proposta, nem no perfil), com atalho para Configurações, para não gerar PDF sem PIX sem querer.

## 2. Blocos de texto não aparecem para a Schanna

O botão "Blocos" é renderizado sem nenhuma trava de plano ou permissão, ao lado dos
rótulos de Descrição, Observações e Termos, e as sugestões prontas vêm do próprio app
(não dependem do banco). Ou seja: não há bloqueio por conta — o problema mais provável é
descoberta/versão em cache. A tabela de blocos está hoje vazia para todos os usuários,
o que reforça que ninguém está encontrando o recurso.

O que muda:
- Tornar o botão visivelmente identificável: rótulo "Inserir bloco de texto" (em vez de só "Blocos"),
  estilo com destaque suave e posicionado logo abaixo de cada campo, não espremido na linha do rótulo.
- Garantir que as sugestões prontas apareçam sempre no topo da lista quando o usuário ainda não tem blocos,
  com um texto curto explicando o que é.
- Depois do ajuste, verificar em navegador (Playwright) que o botão aparece nos três campos
  em desktop e em largura de celular, e que clicar insere o texto.

Se após isso ela ainda não vir, é cache do navegador/app — peço uma recarga forçada para confirmar.

## Detalhes técnicos

- `src/pages/proposals/ProposalView.tsx`: no `handlePdf`, montar `pix` com `buildPixPayload`
  (`src/lib/pix.ts`) usando `proposal.pix_key` → fallback `profiles.pix_key` (via `useBranding`/perfil),
  `merchantName` = empresa/nome, `amount` = `total_amount`, apenas se `currency === 'BRL'`;
  passar `title`/`instructions` traduzidos como já faz `PublicProposal.tsx`.
- `src/components/SnippetPicker.tsx`: ajuste de rótulo/estilo e cabeçalho de sugestões; sem mudança de dados.
- `src/pages/proposals/ProposalForm.tsx`: reposicionar o `SnippetPicker` abaixo de cada `Textarea`.
- Strings novas em `src/i18n/locales/{pt-BR,en}/snippets.json` e `proposals.json`.
- `tsgo` ao final + verificação visual do PDF gerado e do formulário.
