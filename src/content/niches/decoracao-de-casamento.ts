import type { NicheContent } from './types';

export const decoracaoDeCasamento: NicheContent = {
  slug: 'decoracao-de-casamento',
  label: 'Decoração de casamento',
  icon: 'Sparkles',
  accentColor: 'niche-blush',
  heroImage: {
    url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a',
    alt: 'Arranjo de flores para decoração de casamento',
    credit: { name: 'Shardayyy Photography', profileUrl: 'https://unsplash.com/@shardayyy' },
  },
  seoTitle: 'Modelo de orçamento para decoração de casamento e festas',
  seoDescription:
    'Modelo de orçamento de decoração de casamento pronto para copiar: itens do projeto, flores, aluguel de peças, montagem, desmontagem e condições de pagamento.',
  h1: 'Modelo de orçamento para decoração de casamento e festas',
  intro:
    'Decoração é o orçamento com mais itens invisíveis: montagem, desmontagem, transporte, equipe extra, flor sazonal que dobrou de preço. O modelo abaixo separa projeto, locação, flores e operação — e deixa a alteração de escopo com regra e prazo.',
  essentials: [
    'Data, horário e local do evento, com número estimado de convidados',
    'Ambientes atendidos (cerimônia, recepção, mesas, lounge, entrada)',
    'O que é locação (volta para você) e o que é consumível (flor, vela)',
    'Horário de montagem liberado pelo espaço e horário de desmontagem',
    'Prazo limite para alteração de escopo sem custo',
    'Política de cancelamento e remarcação, com valor de reserva retido',
  ],
  template: `ORÇAMENTO — DECORAÇÃO DE EVENTO
Prestador: [seu nome / ateliê] · [CPF/CNPJ] · [telefone]
Cliente: [nomes] · Evento: [casamento] · Data: [data] · Local: [espaço]
Convidados estimados: [x] · Emitido em: [data] · Válido até: [data + 15 dias]

1. PROPOSTA DE PROJETO
[Ex.: decoração de cerimônia e recepção em paleta branco, verde e terracota, com foco em altar, mesas de convidados e mesa dos noivos.]

2. ESCOPO POR AMBIENTE
CERIMÔNIA
- Arranjo de altar ................. 1
- Arranjos de corredor ............. [8]
RECEPÇÃO
- Centros de mesa .................. [12]
- Mesa dos noivos .................. 1
- Lounge com [2] sofás e [1] tapete
- Iluminação decorativa ............ [x] pontos
Inclui: projeto, curadoria de flores, montagem, acompanhamento no início do evento e desmontagem.
Não incluso: mobiliário do espaço, buffet, som, iluminação técnica de palco, flores fora de época sem substituição equivalente.

3. FLORES
Espécies indicadas: [lista]. Em caso de indisponibilidade sazonal, será feita substituição por espécie equivalente em porte e paleta, sem alteração de valor.

4. OPERAÇÃO
Montagem: [data], das [x]h às [x]h. Desmontagem: [data/horário], conforme regra do espaço.
Equipe: [x] pessoas.

5. VALORES
Projeto e curadoria ............. R$ [x]
Locação de peças ................ R$ [x]
Flores e consumíveis ............ R$ [x]
Montagem, equipe e transporte ... R$ [x]
TOTAL ........................... R$ [x]

6. CONDIÇÕES DE PAGAMENTO
[30]% na reserva da data (não reembolsável), [40]% até [60] dias antes e [30]% até [7] dias antes do evento. PIX: [sua chave].

7. ALTERAÇÕES, CANCELAMENTO E ACEITE
Alterações de escopo até [30] dias antes do evento. Depois desse prazo, apenas acréscimos, orçados à parte.
Cancelamento: valor da reserva retido; cancelamento com menos de [30] dias: [50]% do total.
Peças locadas danificadas ou não devolvidas são cobradas pelo valor de reposição.
Para aprovar, confirme por escrito ou pelo link enviado.`,
  extras: [
    { item: 'Montagem e desmontagem', how: 'Equipe, horas e horário noturno; nunca deve estar diluído no valor das flores.' },
    { item: 'Transporte e logística', how: 'Frete de peças grandes, distância do espaço e taxa de acesso do local.' },
    { item: 'Flor sazonal ou importada', how: 'Preveja cláusula de substituição equivalente para não absorver a alta de preço.' },
    { item: 'Reposição de peça locada', how: 'Peça quebrada ou não devolvida é cobrada pelo valor de reposição.' },
    { item: 'Hora extra de evento', how: 'Evento que estende exige equipe de desmontagem mais tarde — valor por hora.' },
    { item: 'Ensaio, prévia e maquete', how: 'Amostra de centro de mesa é produção real; cobre à parte ou abata na aprovação.' },
  ],
  faq: [
    {
      q: 'Como montar o orçamento de decoração de casamento?',
      a: 'Separe em quatro blocos: projeto/curadoria, locação de peças, flores e consumíveis, e operação (equipe, transporte, montagem e desmontagem). Assim o cliente entende que o valor não é "só flor" e você consegue negociar reduzindo escopo, não margem.',
    },
    {
      q: 'Quanto pedir de sinal?',
      a: 'De 30% a 40% na reserva da data, não reembolsável, com o saldo parcelado até a semana do evento. Data de casamento reservada sem sinal é prejuízo garantido em caso de desistência.',
    },
    {
      q: 'Como lidar com flor que sumiu do mercado?',
      a: 'Inclua a cláusula de substituição por espécie equivalente em porte e paleta, como no modelo. Isso evita quebra de contrato e protege sua margem quando o preço da flor dobra na semana do evento.',
    },
    {
      q: 'Devo cobrar montagem e desmontagem separadamente?',
      a: 'Sim. São horas de equipe, transporte e muitas vezes trabalho de madrugada. Quando isso está embutido, o cliente compara seu preço com quem simplesmente não fez essa conta.',
    },
    {
      q: 'Até quando o cliente pode mudar o escopo?',
      a: 'Defina um prazo (30 dias antes é comum) e depois dele aceite apenas acréscimos orçados à parte. Sem prazo escrito, a decoração é redesenhada na véspera com o preço de três meses atrás.',
    },
  ],
};
