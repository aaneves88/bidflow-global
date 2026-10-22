# Atualizar o Roadmap do admin com tudo o que foi feito

O Roadmap do admin (aba Roadmap) é um texto salvo nas configurações do sistema. Vou reescrevê-lo com tudo o que construímos, organizado por fase, marcando o que está pronto, o que está engatilhado e o que é futuro.

## Seções
- **Base e segurança** — proteção de todas as tabelas, funções do servidor, login com Google, limite de cadastros por IP (10/dia), varreduras de segurança.
- **Ativação** — auditoria de cadastro, CPF/CNPJ só ao compartilhar, "+ Novo cliente" dentro da proposta, proposta nova vai direto para compartilhar, proposta-exemplo, site sempre em português.
- **Propostas** — até 3 imagens por produto, link de pagamento (cartão/Mercado Pago) na proposta e no PDF, PIX no PDF, aviso "cliente abriu" (sininho, e-mail, WhatsApp).
- **E-mails** — rotinas automáticas corrigidas (boas-vindas, cupom, follow-up, e-book), e-mail de feedback em 7 dias, disparo manual de novidades no admin com modelos e visual da marca, recuperação de senha por código de 6 dígitos + alterar senha em Minha conta.
- **Admin e métricas** — menus reorganizados em 5 grupos, relatório semanal, ativação por canal, funil das páginas de nicho, Google Ads/GTM.
- **Marketing** — kit de logotipo, nova página inicial escura com marca d'água, criativos e vídeos (tutoriais, educativos, parceiros, anúncios, meios de pagamento), Central de ajuda /ajuda sem download.
- **Engatilhado** — teste de 7 dias + novo preço, e-mails dias 5 e 7, indicação automática/"Seja parceiro", envio com remetente @orca-mento.app (depende de configurar o domínio), ações fora do app.
- **Futuro** — página pública de orçamento para clientes num plano mais caro; plano anual.

## Detalhes técnicos
- Gravar o novo markdown na configuração `roadmap_markdown` (mesmo formato de seções e checkboxes que a tela já lê) e atualizar também o texto padrão em `AdminRoadmap.tsx` e o `roadmap.md` do projeto, para tudo ficar igual.
- Conferir na tela do admin que as seções aparecem com os status corretos.
