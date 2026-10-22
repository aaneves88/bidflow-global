# Envio de novidades saindo como @orca-mento.app (sem caixa de e-mail)

## Como funciona hoje
Os e-mails de boas-vindas, follow-up e feedback saem como @orca-mento.app porque o domínio foi autorizado para o serviço de e-mails do app. Não existe uma caixa de entrada, só a autorização do domínio. Esse serviço não aceita mensagens de novidades.

## O que fazer
O Brevo aceita o mesmo tipo de autorização: em vez de verificar uma caixa de e-mail, ele verifica o domínio.

1. Eu cadastro o domínio `orca-mento.app` no Brevo, por aqui mesmo, e busco os códigos de autorização que o Brevo gerar.
2. Os códigos entram nas configurações do domínio:
   - Se o domínio foi comprado pela Lovable, eles vão em Configurações do projeto > Domínios > Registros DNS. Eu passo os valores exatos, prontos para copiar.
   - Se foi comprado em outro lugar (registro.br etc.), eles vão no painel desse site.
3. Eu confirmo a autorização no Brevo e troco o remetente da tela de disparo do admin para `Orca <novidades@orca-mento.app>`. As respostas continuam indo para statematch@statematch.global.
4. Envio um teste só para você e, depois da sua aprovação, faço o disparo.

## O que não muda
- A tela de disparo no admin, os modelos, a seleção de usuários, o descadastro e os registros de envio.
- Os e-mails automáticos atuais.

## Até a autorização sair
O botão de envio fica liberado com o remetente atual, mas só dispara quando você quiser.
