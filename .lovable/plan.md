# Menu, painel com ações rápidas e e-mail da Schanna

## Por que a Schanna recebeu o e-mail
Ela clicou em "Assinar" no dia 14/out (teste interno) e não pagou. O e-mail diário pega quem clicou de 1 a 14 dias atrás sem plano pago, e hoje (28/out) ela ainda estava no limite. A rotina não sabe que ela é da equipe. Foi o único envio para ela; não volta a sair.

**Correção:** a rotina passa a pular contas da equipe (administradores e uma lista de e-mails internos: Antonio e Schanna). Isso vale para este e-mail.

## 1. Menu reorganizado
- Botão em destaque no topo: "+ Nova proposta"
- Principal: Painel, Propostas, Clientes, Produtos e serviços
- Recursos: Modelos de texto, Ajuda (vídeos)
- Conta: Planos, Indique e ganhe, Minha conta, Configurações
- Funciona igual no celular

## 2. Painel com ações rápidas
- Botão "+ Novo orçamento" no topo do Painel, sempre visível
- 3 cartões logo abaixo: Criar orçamento, Cadastrar cliente, Ver vídeos rápidos
- O resto do Painel continua igual

## Detalhes técnicos
- `AppSidebar.tsx`: grupos com `SidebarGroupLabel`, botão CTA para `/proposals/new`
- `Dashboard.tsx`: header CTA + grid de 3 cards (`/proposals/new`, `/clients?new=1` ou abrir `ClientDialog`, `/ajuda`)
- `send-checkout-rescue`: pular `user_roles.role='admin'` e e-mails internos; redeploy
- Textos via i18n pt-BR/en
