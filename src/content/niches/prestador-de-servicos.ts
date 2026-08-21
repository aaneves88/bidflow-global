import type { NicheContent } from './types';

export const prestadorDeServicos: NicheContent = {
  slug: 'prestador-de-servicos',
  label: 'Prestador de serviços',
  seoTitle: 'Modelo de orçamento de prestação de serviços pronto para copiar',
  seoDescription:
    'Modelo de orçamento de prestação de serviços para autônomos e pequenas empresas: escopo, exclusões, prazo, valores, condições de pagamento e validade.',
  h1: 'Modelo de orçamento de prestação de serviços',
  intro:
    'Serve para qualquer serviço prestado por autônomo ou pequena empresa: manutenção, reforma, pintura, jardinagem, limpeza, montagem, assistência técnica, serviços administrativos. É o modelo genérico — se o seu serviço tem um modelo específico logo abaixo, use aquele.',
  essentials: [
    'Identificação completa das duas partes, com CPF/CNPJ',
    'Descrição do serviço em linguagem do cliente, não técnica',
    'Escopo com quantidades e uma lista explícita do que NÃO está incluído',
    'Prazo em dias úteis contado do aceite',
    'Valores por item e total, com material separado da mão de obra',
    'Condições de pagamento, validade do orçamento e forma de aceite',
  ],
  template: `ORÇAMENTO DE PRESTAÇÃO DE SERVIÇOS
Prestador: [seu nome / empresa] · [CPF/CNPJ] · [telefone] · [e-mail]
Cliente: [nome] · [CPF/CNPJ] · Local do serviço: [endereço]
Orçamento nº [001] · Emitido em: [data] · Válido até: [data + 15 dias]

1. SERVIÇO SOLICITADO
[Descreva em 2 a 4 linhas o que o cliente precisa, com as palavras dele.]

2. ESCOPO
- [Serviço/entregável 1] ......... [qtd]
- [Serviço/entregável 2] ......... [qtd]
- [Serviço/entregável 3] ......... [qtd]
Não incluso: [liste aqui o que costuma ser confundido como incluído — material, deslocamento fora da região, retrabalho por mudança de pedido, serviços de terceiros].

3. PRAZO
Início em até [x] dias úteis após o aceite. Conclusão estimada em [x] dias úteis.
O prazo é contado do aceite e do envio de [informações/acessos/material] pelo cliente.

4. VALORES
[Item 1] ............... R$ [x]
[Item 2] ............... R$ [x]
Material ............... R$ [x]
Deslocamento ........... R$ [x]
Subtotal ............... R$ [x]
Desconto ............... R$ [x]
TOTAL .................. R$ [x]

5. CONDIÇÕES DE PAGAMENTO
[50% no aceite e 50% na entrega] via PIX: [sua chave].
Atraso superior a [x] dias suspende a execução até a regularização.

6. ALTERAÇÕES DE ESCOPO
Pedidos fora do escopo acima são orçados separadamente e executados somente após aprovação por escrito.

7. VALIDADE, GARANTIA E ACEITE
Este orçamento é válido por [15] dias. Garantia de [90] dias sobre o serviço executado.
Para aprovar, confirme por escrito ou aprove pelo link enviado.`,
  extras: [
    { item: 'Material e insumos', how: 'Ou o cliente compra, ou o valor é estimado e ajustado pela nota fiscal.' },
    { item: 'Deslocamento', how: 'Defina a região inclusa; fora dela, valor por km ou taxa fixa.' },
    { item: 'Taxa de visita/diagnóstico', how: 'Cobrada e abatida do serviço se o orçamento for aprovado.' },
    { item: 'Urgência e fora de horário', how: 'Fim de semana, feriado e chamado emergencial com acréscimo definido.' },
    { item: 'Retrabalho por mudança de pedido', how: 'Refazer porque o cliente mudou de ideia é serviço novo, não garantia.' },
    { item: 'Serviços de terceiros', how: 'Frete, aluguel de equipamento e taxas de órgãos repassados como custo.' },
  ],
  faq: [
    {
      q: 'Qual a diferença entre orçamento e proposta comercial?',
      a: 'O orçamento é a parte financeira: itens, quantidades e valores. A proposta comercial envolve o orçamento com contexto — o que você entendeu do problema, o que vai entregar, em quanto tempo e sob quais condições. Na prática, proposta fecha mais que orçamento solto.',
    },
    {
      q: 'O orçamento tem valor legal?',
      a: 'Orçamento aprovado por escrito passa a valer como acordo entre as partes sobre escopo, prazo e preço. Por isso importam três campos: validade, lista do que não está incluído e registro do aceite (data e forma).',
    },
    {
      q: 'Preciso ter CNPJ para enviar orçamento?',
      a: 'Não. Autônomo pode orçar e receber com CPF. O CNPJ (MEI, por exemplo) passa a fazer diferença quando o cliente exige nota fiscal, o que é comum em contratos com empresas.',
    },
    {
      q: 'Devo colocar preço por item ou só o total?',
      a: 'Por item. Detalhar permite negociar reduzindo escopo em vez de dar desconto, e mostra ao cliente onde o dinheiro está sendo aplicado.',
    },
    {
      q: 'Por quanto tempo deixar o orçamento válido?',
      a: 'De 7 a 20 dias na maioria dos serviços. Prazo curto protege seus custos e sua agenda, e cria urgência real sem pressão artificial.',
    },
  ],
};
