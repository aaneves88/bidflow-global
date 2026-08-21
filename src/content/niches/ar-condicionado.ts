import type { NicheContent } from './types';

export const arCondicionado: NicheContent = {
  slug: 'ar-condicionado',
  label: 'Ar-condicionado',
  seoTitle: 'Modelo de orçamento de ar-condicionado (instalação e manutenção)',
  seoDescription:
    'Modelo de orçamento para instalação, limpeza e manutenção de ar-condicionado pronto para copiar: BTUs, metragem de tubulação, material, garantia e pagamento.',
  h1: 'Modelo de orçamento para instalação e manutenção de ar-condicionado',
  intro:
    'Instalação de split é o serviço em que o orçamento mais estoura: a tubulação extra, o suporte, o dreno e a infraestrutura elétrica quase nunca estão no combinado inicial. O modelo abaixo lista tudo isso como item, com metragem inclusa e valor do metro adicional.',
  essentials: [
    'Modelo, capacidade em BTUs e quantidade de equipamentos',
    'Metragem de tubulação inclusa e valor por metro adicional',
    'Se a infraestrutura (elétrica, dreno, furo em parede) já existe',
    'Se o equipamento é fornecido pelo cliente ou por você',
    'Garantia da instalação separada da garantia do fabricante',
    'Periodicidade, se for contrato de manutenção preventiva',
  ],
  template: `ORÇAMENTO — AR-CONDICIONADO
Prestador: [seu nome] · [CPF/CNPJ] · [telefone]
Cliente: [nome] · Local: [endereço]
Emitido em: [data] · Válido até: [data + 10 dias]

1. SERVIÇO SOLICITADO
[Ex.: instalação de 2 splits de 12.000 BTUs (equipamento do cliente) em imóvel residencial.]

2. ESCOPO
- Instalação de split hi-wall ......... [2] un.
- Tubulação de cobre inclusa .......... até [3] m por equipamento
- Suporte da condensadora ............. [2] un.
- Vácuo, teste de estanqueidade e teste de operação ... incluso
- Dreno com [até 3] m e caimento adequado ... incluso
Não incluso: equipamento, ponto elétrico dedicado e disjuntor, quebra e reparo de alvenaria/pintura, bomba de dreno, infraestrutura em altura com andaime.

3. SERVIÇOS ADICIONAIS (SE NECESSÁRIO)
Metro adicional de tubulação ......... R$ [x]/m
Ponto elétrico dedicado .............. R$ [x]
Bomba de dreno ....................... R$ [x]
Limpeza técnica completa ............. R$ [x]/equipamento
Carga de gás ......................... R$ [x]

4. PRAZO
Execução em [1] dia útil, agendada para [data], em horário comercial.

5. VALORES
Instalação ([2] equipamentos) ...... R$ [x]
Material (suporte, dreno, fixação) ... R$ [x]
Deslocamento ....................... R$ [x]
TOTAL .............................. R$ [x]

6. CONDIÇÕES DE PAGAMENTO
[Pagamento na conclusão / 50% no aceite e 50% na conclusão] via PIX: [sua chave].

7. GARANTIA E ACEITE
Garantia de [90] dias sobre a instalação. A garantia do equipamento é do fabricante e exige nota fiscal e laudo de instalação.
Para aprovar, confirme por escrito ou pelo link enviado.`,
  extras: [
    { item: 'Tubulação além do incluso', how: 'Defina metragem inclusa e valor por metro adicional — é o extra mais comum.' },
    { item: 'Ponto elétrico e disjuntor', how: 'Split exige circuito dedicado. Se não existe, é serviço elétrico à parte.' },
    { item: 'Bomba de dreno', how: 'Necessária quando não há caimento natural; equipamento e instalação separados.' },
    { item: 'Alvenaria, furo e acabamento', how: 'Furo em concreto, quebra e pintura não entram na instalação.' },
    { item: 'Serviço em altura', how: 'Fachada, andaime ou rapel muda o risco e o custo; orçamento próprio.' },
    { item: 'Carga de gás e limpeza', how: 'Manutenção é serviço distinto da instalação, com valor por equipamento.' },
  ],
  faq: [
    {
      q: 'Quanto cobrar para instalar um ar-condicionado split?',
      a: 'Precifique por equipamento, com uma metragem de tubulação inclusa (normalmente 3 metros) e valor por metro adicional. Considere BTUs, altura da instalação, deslocamento e se a infraestrutura elétrica já existe.',
    },
    {
      q: 'A tubulação de cobre entra no valor da instalação?',
      a: 'Só a metragem que você declarar no orçamento. Acima disso, cobre por metro. Sem essa linha escrita, o cliente entende que o valor cobre qualquer distância entre evaporadora e condensadora.',
    },
    {
      q: 'Como orçar limpeza e manutenção preventiva?',
      a: 'Valor por equipamento e por visita, com periodicidade sugerida (a cada 6 meses em ambiente residencial). Para empresas, ofereça contrato mensal ou semestral com quantidade fixa de equipamentos — receita recorrente vale mais que a instalação avulsa.',
    },
    {
      q: 'Quem responde pela garantia: eu ou o fabricante?',
      a: 'Separe as duas no orçamento. Você garante a instalação (normalmente 90 dias); o equipamento é garantido pelo fabricante e a garantia depende de instalação feita conforme manual, com laudo e nota.',
    },
    {
      q: 'Devo instalar equipamento comprado pelo cliente?',
      a: 'Pode, mas registre no orçamento que o equipamento foi fornecido pelo cliente e que danos preexistentes ou incompatibilidade de infraestrutura não são de sua responsabilidade.',
    },
  ],
};
