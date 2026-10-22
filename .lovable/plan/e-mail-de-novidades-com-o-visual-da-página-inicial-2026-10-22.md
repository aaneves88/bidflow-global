# E-mail de novidades com o visual da página inicial

O texto aprovado fica exatamente igual. Muda só a aparência, e o remetente continua o atual: Orca <statematch@statematch.global>.

## Novo visual
- **Topo escuro**, como na página inicial: fundo azul-carvão (#0F172A), linhas finas em ciano e verde-água imitando as fitas do fundo do site, sem moedas. No centro, a logo clara da orquinha com "Orca" ao lado.
- **Corpo branco e limpo**, com títulos em azul-carvão, o mesmo tipo de letra do site e espaçamento mais generoso.
- **Dois blocos de novidade em cartões** com uma faixa ciano na lateral e um ícone simples no lugar do emoji.
- **Botão em cada novidade**, no estilo dos botões do site: "Configurar meu link" leva para Minha conta e "Ver tutoriais" leva para Ajuda e tutoriais.
- **Rodapé escuro** com "orca-mento.app", a frase de por que a pessoa recebeu o e-mail e o link de descadastro.
- As mensagens personalizadas escritas na tela de disparo usam o mesmo visual.

## Teste
- Na tela de disparo vai haver um botão "Enviar teste para mim". O teste não conta como envio real, então você pode repetir quantas vezes quiser e continua recebendo no disparo de verdade.
- Eu mando um novo teste para aaneves88@gmail.com e você aprova antes do disparo para todos.

## Detalhes técnicos
- `admin-broadcast/templates.ts`: novo `brandWrapper`, com tabelas e estilos inline para funcionar no Gmail e no Outlook. A logo é uma imagem PNG hospedada no orca-mento.app (`orca-lockup-horizontal` na versão clara).
- `admin-broadcast/index.ts`: nova opção `test: true`, que envia só para o e-mail do admin, ignora a regra de uma vez por pessoa e registra o envio como `test`.
- `AdminBroadcast.tsx` e i18n: novo botão de teste. Depois disso, redeploy da função.
