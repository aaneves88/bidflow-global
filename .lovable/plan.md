# Prender a atenção de quem chega ao Orca

## O que os números já mostram
- Instagram e Facebook trazem cadastros (13 em 30 dias), mas só 3 dessas pessoas criaram proposta.
- 13 das 14 pessoas que nunca criaram proposta entraram só no dia do cadastro e não voltaram.
- O pagamento (e o nome StateMatch na tela de pagamento) não é o motivo: quase ninguém chega até lá.

Conclusão: a pessoa não vê valor nos primeiros minutos. Ela precisa entender rápido o que ganha e ver uma proposta pronta.

## O que eu mudaria (nesta ordem)

1. **Página inicial com promessa clara em 5 segundos**
   - Título direto: "Mande um orçamento profissional pelo WhatsApp em 2 minutos".
   - Logo abaixo, uma proposta de exemplo de verdade (com logo, itens, PIX e botão de aceitar), para a pessoa ver o resultado antes de se cadastrar.
   - Um único botão principal: "Criar minha proposta grátis".

2. **Cadastro continua sendo o primeiro passo**
   - Nada de criar proposta sem conta. A proposta de exemplo na página inicial é só uma imagem para mostrar o resultado.
   - O botão leva direto ao cadastro, e logo depois a pessoa cai na primeira proposta já preenchida.


3. **O anúncio e a página falam a mesma coisa**
   - Quem vem de um anúncio de ramo (eletricista, fotógrafo etc.) cai direto na página daquele ramo, não na página inicial geral.
   - Vou listar quais links dos anúncios devem ser trocados (essa troca é feita por você nos anúncios).

4. **Primeiro acesso em 3 passos visíveis**
   - Depois do cadastro, uma barra simples: "1. Sua proposta  2. Seu cliente  3. Enviar no WhatsApp", com o passo atual em destaque.
   - Ao terminar o passo 3: mensagem "Pronto! Avisaremos quando seu cliente abrir."

5. **Medir para saber se melhorou**
   - Contar quantas pessoas veem a proposta de exemplo, clicam no botão principal e chegam a enviar a primeira proposta.
   - Esses números aparecem no admin, para compararmos antes e depois.

## Fica de fora
- Preço, dias grátis, limite de 3 propostas e nome da loja no pagamento.

## Detalhes técnicos
- Página inicial: ajustar o topo da página inicial (mantendo o tema escuro e a marca d'água sem moedas) e incluir uma prévia da proposta de exemplo já existente no onboarding.
- Modo exemplo sem conta: rota pública somente leitura com a proposta de exemplo; cadastro solicitado ao salvar/enviar.
- Barra de progresso no primeiro acesso usando dados de proposta, cliente e envio do próprio usuário.
- Novos eventos em product_events (demo_viewed, hero_cta_clicked, first_proposal_sent) e um quadro no admin.
- Todos os textos via traduções pt-BR/en.
