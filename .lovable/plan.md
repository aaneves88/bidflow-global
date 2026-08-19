# Propostas: visão Kanban + popup de envio ao marcar "Enviada"

Gostei da ideia — as duas coisas se reforçam: o Kanban dá visão do funil e o popup transforma "mudei o status" em "realmente enviei pro cliente".

## 1. Alternância Lista / Kanban

Na tela `/proposals`, um seletor no topo (Lista | Kanban), com a preferência lembrada no navegador.

- Colunas na ordem dos status configurados: Rascunho, Enviada, Visualizada, Aprovada, Rejeitada, Expirada.
- Cada cartão mostra: título, cliente, valor, data e aviso de "válida até" quando estiver perto de vencer.
- Cabeçalho de cada coluna com contagem de propostas e soma dos valores.
- Arrastar o cartão entre colunas muda o status (mesma ação que já existe hoje na tela da proposta), com atualização otimista e desfazer em caso de erro.
- Clique no cartão abre a proposta.
- No celular, as colunas rolam na horizontal; arrastar continua funcionando via toque.

## 2. Popup de envio ao mover para "Enviada"

Ao arrastar (ou mudar) uma proposta para o status **Enviada**, abre um diálogo "Enviar proposta" com as opções que já existem hoje na tela da proposta:

- **WhatsApp** — usa o telefone do cliente; se não houver, pede o número e oferece salvar no cadastro.
- **E-mail** — envia a cópia da proposta para o e-mail do cliente (editável).
- **Copiar link** público.
- Botão "Só mudar o status" para quem já enviou por fora.

O status vira "Enviada" de qualquer forma; o popup é um empurrão para a ação, não um bloqueio. Nada de e-mail é disparado sem o usuário confirmar.

## Detalhes técnicos

- Reaproveitar a lógica de envio hoje embutida em `src/pages/proposals/ProposalView.tsx` extraindo um componente compartilhado `src/components/proposals/SendProposalDialog.tsx` (WhatsApp + e-mail + copiar link + salvar telefone), usado nas duas telas.
- Novo `src/pages/proposals/ProposalsKanban.tsx`, alimentado por `useProposals()` e `useProposalStatuses()`; mutação via `useUpdateProposalStatus()` (mantém histórico e notificações já existentes).
- Drag & drop com `@dnd-kit/core` + `@dnd-kit/sortable` (nova dependência leve, com suporte a toque e teclado).
- Detecção do status "Enviada" pela posição/nome do status para não quebrar se o admin renomear: prioriza `position = 1` entre os não finais, com fallback por nome.
- Preferência de visualização em `localStorage`.
- Todos os textos novos via i18n em `proposals.json` (pt-BR e en).
- Sem mudanças de banco.
