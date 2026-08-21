import type { NicheContent } from './types';

export const eletricista: NicheContent = {
  slug: 'eletricista',
  label: 'Eletricista',
  icon: 'Zap',
  accentColor: 'niche-amber',
  heroImage: {
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
    alt: 'Eletricista instalando fiação em um quadro elétrico',
    credit: { name: 'Emmanuel Ikwuegbu', profileUrl: 'https://unsplash.com/@emmages' },
  },
  seoTitle: 'Modelo de orçamento para eletricista: exemplo pronto para copiar',
  seoDescription:
    'Modelo de orçamento de serviços elétricos pronto para copiar: pontos, quadro, material, deslocamento, prazo e condições de pagamento. Com o que cobrar à parte.',
  h1: 'Modelo de orçamento para eletricista',
  intro:
    'Orçamento de serviço elétrico costuma dar prejuízo em dois pontos: material entrando "por conta" do profissional e serviço extra que aparece depois do quadro aberto. O modelo abaixo separa mão de obra, material e visita técnica, e deixa por escrito o que não está incluído.',
  essentials: [
    'Endereço do serviço e tipo de imóvel (residencial, comercial, obra em andamento)',
    'Quantidade de pontos por tipo (tomada, iluminação, interruptor, ponto de força)',
    'Se o material é fornecido por você ou pelo cliente',
    'Se há necessidade de ART/laudo e quem paga a taxa',
    'Prazo em dias úteis contado do aceite, não da data do orçamento',
    'Validade do orçamento — preço de cabo e disjuntor muda rápido',
  ],
  template: `ORÇAMENTO — SERVIÇOS ELÉTRICOS
Prestador: [seu nome] · [CPF/CNPJ] · [telefone]
Cliente: [nome] · Local do serviço: [endereço]
Emitido em: [data] · Válido até: [data + 10 dias]

1. SERVIÇO SOLICITADO
[Ex.: instalação de 12 pontos elétricos e troca do quadro de distribuição em imóvel residencial de 2 quartos.]

2. ESCOPO (MÃO DE OBRA)
- Instalação de ponto de tomada 10A ............ 8 un.
- Instalação de ponto de iluminação ............ 4 un.
- Troca de quadro de distribuição (8 disjuntores) ... 1 un.
- Teste de carga e identificação dos circuitos ...... incluso
Não incluso: alvenaria, pintura, reparo de acabamento, passagem de nova entrada de energia junto à concessionária.

3. MATERIAL
( ) Material fornecido pelo cliente conforme lista enviada
( ) Material fornecido pelo prestador — valor estimado R$ [x], reajustável conforme nota fiscal de compra

4. PRAZO
Início em até [x] dias úteis após o aceite. Execução estimada: [x] dias úteis.
Serviço executado em horário comercial (seg a sex, 8h às 18h).

5. VALORES
Mão de obra — pontos elétricos ...... R$ [x]
Mão de obra — quadro de distribuição ... R$ [x]
Deslocamento ........................ R$ [x]
Material (se por conta do prestador) ... R$ [x]
TOTAL ............................... R$ [x]

6. CONDIÇÕES DE PAGAMENTO
[50% no início e 50% na conclusão] via PIX: [sua chave].
Serviço extra identificado durante a execução é orçado à parte e só executado com aprovação por escrito.

7. GARANTIA E ACEITE
Garantia de [90] dias sobre a mão de obra executada. Para aprovar, confirme este orçamento por escrito ou pelo link enviado.`,
  extras: [
    { item: 'Material elétrico', how: 'Cabo, disjuntor, conduíte e tomada variam de preço; ou cliente compra, ou o valor é revisado pela nota.' },
    { item: 'Taxa de visita técnica', how: 'Cobre o diagnóstico. Costuma ser abatida do serviço se o orçamento for aprovado.' },
    { item: 'Deslocamento', how: 'Por km ou valor fixo por região. Fora do combinado, refaz o orçamento.' },
    { item: 'Trabalho fora do horário', how: 'Noite, fim de semana e feriado com acréscimo percentual definido no orçamento.' },
    { item: 'ART / laudo técnico', how: 'Taxa do conselho é repassada ao cliente, separada da mão de obra.' },
    { item: 'Reparo de alvenaria e pintura', how: 'Quebrar parede para passar conduíte não inclui fechar e pintar.' },
  ],
  faq: [
    {
      q: 'Como calcular o preço de um ponto elétrico?',
      a: 'A prática mais comum é preço por ponto, considerando tempo médio de instalação, dificuldade do imóvel (laje, forro, alvenaria) e sua meta de valor-hora. Some deslocamento e material separadamente, para o cliente ver que o preço do ponto é só mão de obra.',
    },
    {
      q: 'Devo cobrar a visita técnica?',
      a: 'Sim, quando o diagnóstico exige deslocamento e tempo. O caminho que menos gera atrito é cobrar a visita e abatê-la do serviço caso o orçamento seja aprovado — isso está previsto no modelo acima.',
    },
    {
      q: 'O material entra no orçamento do eletricista?',
      a: 'Pode entrar das duas formas. Se você compra, deixe claro que o valor é estimado e ajustável pela nota fiscal, porque cabo e disjuntor oscilam. Se o cliente compra, envie a lista de especificação por escrito para não receber material fora da bitola.',
    },
    {
      q: 'Por quanto tempo o orçamento elétrico fica válido?',
      a: 'De 7 a 10 dias quando há material envolvido. Prazo curto protege você da variação de preço e da sua própria agenda.',
    },
    {
      q: 'E se aparecer serviço extra durante a execução?',
      a: 'Nunca execute e cobre depois. O modelo já prevê a cláusula: extra identificado na obra é orçado à parte e só executado com aprovação por escrito — no Orca isso vira uma segunda proposta em dois minutos.',
    },
  ],
};
