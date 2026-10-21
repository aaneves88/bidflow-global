# Comunicar as novidades aos clientes

O envio de e-mail que já temos (boas-vindas, lembretes, "cliente abriu") só pode mandar mensagens individuais causadas por uma ação da pessoa. Ele não pode mandar novidades para todos, nem mesmo para poucas pessoas. Por isso a proposta tem duas partes.

## 1. Aviso dentro do Orca (faço agora, sem custo)
- Quando a pessoa entrar no Orca, aparece um quadro **"Novidades"** no topo do painel com o seu texto aprovado:
  - Pagamento por link direto na proposta, com o botão "Configurar meu link", que leva para Minha conta.
  - Central de Ajuda e Tutoriais, com o botão "Ver tutoriais".
- Ao mesmo tempo chega um aviso no **sininho** para todos os usuários cadastrados.
- A pessoa pode fechar o quadro, e ele não volta mais.
- O quadro aparece nos planos Gratuito e Premium, em português.

## 2. E-mail de novidades (opcional, depende de você)
- Conectar o Brevo (tem plano grátis; você cria a conta e verifica o remetente).
- Depois eu preparo o envio do seu texto exato para os 33 usuários, sem mandar para quem pediu para sair da lista, com link de descadastro e registro de cada envio.
- Antes de disparar, mostro a contagem final e a prévia do e-mail para você aprovar.

## Detalhes técnicos
- Tabela `announcements` (chave, ativa) + `announcement_dismissals` (user_id, chave), com RLS para o próprio usuário. A outra opção é guardar "fechado" no localStorage.
- Inserir uma notificação na tabela de notificações já existente para cada perfil, chave `novidades-pagamento-ajuda`, uma vez por usuário.
- Componente `WhatsNewBanner` no Dashboard, com textos em i18n pt-BR/en.
- Brevo: conector padrão; edge function só para admin, com claim de idempotência em `email_send_log` (`template_name = 'novidades-pagamento-ajuda'`), filtro de `suppressed_emails` e token de `email_unsubscribe_tokens`.
