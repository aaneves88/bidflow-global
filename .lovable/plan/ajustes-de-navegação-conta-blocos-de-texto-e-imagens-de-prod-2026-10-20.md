# Ajustes de navegação, conta, blocos de texto e imagens de produto

## 1. Admin com menus agrupados
São 20 abas soltas hoje. Elas passam a ficar em 5 grupos. Cada grupo mostra as suas abas logo abaixo.

```text
Números    -> Visão geral, Semanal, Nichos
Usuários   -> Usuários, Suporte, Leads e-book
Vendas     -> Planos, Indicações, Parceiros
Marketing  -> Materiais, Vídeos, Marca
Sistema    -> Status, Integrações, QA, Roadmap
```
O endereço lembra a aba aberta, então ao recarregar a página você volta para a mesma aba.

## 2. "Planos" e "Indique" dentro do app
- Hoje esses itens do menu levam a páginas públicas, sem o menu lateral.
- Para quem está logado, eles passam a abrir dentro do app, com o menu lateral. As páginas públicas continuam iguais para quem vem do site.

## 3. "Minha conta" do aaneves
- Confirmado no banco: a conta aaneves88 **não tem nenhum plano concedido**. Ela é administradora, e por isso já tem tudo liberado. A tela mostra "Plano gratuito" porque não encontra plano nenhum.
- Correção: para administradores, a tela passa a mostrar "Administrador — acesso total".
- Se você quiser um Premium formal nessa conta, eu concedo pela aba Planos. Me diga.

## 4. Explicação em "Blocos de texto"
- No topo da página entra um quadro curto explicando para que servem os blocos (termos, condições, "por que eu", observações) e como usá-los na proposta. O quadro pode ser fechado e não volta mais.
- Na proposta, um ícone de ajuda ao lado do campo onde se escolhe o bloco.

## 5. Até 3 imagens por produto
- Na tela de produto: enviar até 3 imagens (JPG/PNG/WebP, até 5 MB cada), com miniaturas e botão de remover.
- Quando um item da proposta vem de um produto cadastrado, ele fica ligado a esse produto.
- Na página da proposta que o cliente abre, entra uma seção **"Anexo — Produtos"** no final. Para cada produto aparecem o nome, a descrição técnica e as imagens, tudo na mesma ordem dos itens.
- O PDF ganha o mesmo anexo no final.
- Propostas antigas, ou itens digitados à mão, continuam sem anexo.

## Detalhes técnicos
- Admin: `Admin.tsx` com dois níveis (grupo, depois aba), estado guardado em `?tab=`, textos em i18n pt-BR/en.
- Planos e Indique: novas rotas protegidas `/app/planos` e `/app/indique` dentro do `AppLayout`, reaproveitando o conteúdo de `Pricing`/`Referrals`. `AppSidebar` passa a apontar para elas.
- Conta: `AccountPage` passa a usar `isAdmin` do `useAuth`.
- Imagens: novo bucket público `product-images` (pasta `{user_id}/{product_id}/`), com regras de envio e remoção só pelo dono. Novas colunas: `products.image_urls text[] default '{}'` e `proposal_items.product_id uuid null`. `get_public_proposal` passa a devolver os produtos ligados (nome, descrição, imagens). O anexo entra em `PublicProposal` e no gerador de PDF.
