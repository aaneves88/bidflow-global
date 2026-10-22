# Disparo manual de novidades saindo como noreply@orca-mento.app

## Situação
A tela de disparo manual no admin já está pronta: você escolhe o modelo, marca os usuários, vê a prévia e envia. Falta só uma coisa: fazer o remetente aparecer como `Orca <noreply@orca-mento.app>`.

Para isso não é preciso ter uma caixa de e-mail. Basta autorizar o domínio uma única vez, do mesmo jeito que já foi feito para os e-mails de boas-vindas.

## Passos
1. Eu registro o orca-mento.app no serviço que faz o envio e pego os códigos de autorização. São 2 ou 3 linhas de texto.
2. Eu verifico onde o domínio é administrado:
   - Se for pela Lovable, te passo os códigos prontos e o caminho exato: Configurações do projeto > Domínios > Registros DNS. Você só cola os códigos lá.
   - Se for em outro lugar, como o registro.br, te passo o passo a passo desse painel.
3. Depois que os códigos estiverem colados, eu confirmo a autorização e mudo o remetente para `Orca <noreply@orca-mento.app>`.
4. Eu mando um teste só para você. Com a sua aprovação, eu publico a tela e você faz o disparo.

## O que não muda
- Os e-mails automáticos atuais continuam como estão.
- O descadastro continua funcionando e cada envio fica registrado.
