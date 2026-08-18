# Blocos reutilizáveis de texto (item 3)

## O problema que resolve

Hoje o freelancer reescreve (ou copia de outra proposta) sempre os mesmos textos: condições de pagamento, prazo de entrega, política de revisões, escopo padrão, garantia. Os **modelos de proposta** que já existem resolvem só o começo — eles preenchem a proposta inteira de uma vez, no momento da criação. Depois disso, se a pessoa quiser inserir "50% na aprovação, 50% na entrega" numa proposta que já está montada, não tem atalho.

Blocos reutilizáveis são pedaços de texto salvos pelo próprio usuário, que ele insere com um clique em qualquer proposta, a qualquer momento. É para texto o que o catálogo de Produtos já é para itens de valor.

Diferença rápida:

```text
Modelo de proposta  -> monta a proposta inteira (itens + notas + termos), só na criação
Catálogo de produtos -> insere UM item de valor na tabela
Bloco reutilizável   -> insere UM trecho de texto em Notas, Termos ou Descrição, sempre
```

## Como funciona na prática

1. Na proposta, ao lado dos campos **Descrição**, **Observações** e **Termos e condições**, aparece um botão "Blocos".
2. O botão abre uma lista dos blocos salvos do usuário (filtrada pelo tipo do campo), com busca. Clicar insere o texto no fim do campo, sem apagar o que já estava escrito.
3. Ao lado, um botão "Salvar como bloco" pega o texto atual do campo e pede só um título curto ("Pagamento 50/50").
4. Uma tela de gerenciamento lista todos os blocos, permite editar, renomear e excluir.
5. Na primeira vez, o usuário já encontra alguns blocos-modelo prontos (pagamento, prazo, revisões, validade, cancelamento) que ele pode inserir e editar — sem precisar criar nada do zero.

## Escopo da entrega

- Nova tabela de blocos por usuário, com RLS (cada um vê só os seus).
- Popover de inserção nos três campos de texto da proposta.
- Ação "salvar como bloco" a partir do campo atual.
- Tela de gerenciamento (lista, criar, editar, excluir), no mesmo padrão da tela de Produtos.
- Blocos-modelo sugeridos para quem ainda não tem nenhum.
- Todos os textos via i18n (pt-BR e en).

Fora do escopo agora: variáveis dinâmicas ({{cliente}}, {{valor}}), compartilhamento entre contas, blocos com formatação rica.

## Detalhes técnicos

- Tabela `public.text_snippets`: `id`, `user_id`, `kind` (`description` | `notes` | `terms`), `title`, `body`, `position`, timestamps. GRANT para `authenticated`/`service_role`, RLS com as 4 políticas por `user_id = auth.uid()`.
- Hook `src/hooks/useSnippets.ts` no padrão de `useProducts.ts` (React Query, filtro explícito por `user_id`).
- Componente `src/components/SnippetPicker.tsx` (popover + busca + inserir) e `src/components/SaveSnippetButton.tsx`, usados em `ProposalForm.tsx` nos campos de descrição, notas e termos.
- Página `src/pages/snippets/Snippets.tsx` + rota, espelhando `Products.tsx`, com item no `AppSidebar`.
- Blocos-modelo em `src/lib/snippetPresets.ts`, exibidos como sugestões quando a lista está vazia (inseridos sob demanda, não semeados no banco).
- Namespace i18n novo `snippets` em pt-BR e en.
- `tsgo` ao final.
