import type { NicheContent } from './types';

export const fotografo: NicheContent = {
  slug: 'fotografo',
  label: 'Fotógrafo',
  icon: 'Camera',
  accentColor: 'niche-coral',
  heroImage: {
    url: 'https://images.unsplash.com/photo-1513031300226-c8fb12de9ade',
    alt: 'Pessoa fotografando com uma câmera Canon',
    credit: { name: 'Ailbhe Flynn', profileUrl: 'https://unsplash.com/@aflynnn' },
  },
  seoTitle: 'Modelo de orçamento para fotógrafo: exemplo pronto para copiar',
  seoDescription:
    'Modelo de orçamento de fotografia pronto para copiar: horas de cobertura, número de fotos tratadas, prazo de entrega, direitos de uso e condições de pagamento.',
  h1: 'Modelo de orçamento para fotógrafo',
  intro:
    'Em fotografia, o prejuízo raramente está no preço do dia — está na hora extra não combinada, na revisão infinita do tratamento e no cliente que pede o arquivo bruto depois. O modelo abaixo fecha esses três pontos por escrito.',
  essentials: [
    'Data, horário de início e horas de cobertura contratadas',
    'Local (e se há deslocamento, diária ou hospedagem)',
    'Quantidade de fotos entregues tratadas, não "todas as fotos"',
    'Prazo de entrega em dias úteis após o evento/sessão',
    'Direitos de uso: pessoal, comercial, redes sociais, mídia paga',
    'Se arquivo bruto (RAW) entra ou não — o padrão é não entrar',
  ],
  template: `ORÇAMENTO — FOTOGRAFIA
Fotógrafo: [seu nome] · [CPF/CNPJ] · [telefone] · [portfólio]
Cliente: [nome]
Emitido em: [data] · Válido até: [data + 15 dias]

1. O QUE FOI PEDIDO
[Ex.: cobertura fotográfica de casamento no dia [data], em [local], com entrega para álbum e redes sociais.]

2. ESCOPO DA ENTREGA
- Cobertura de [8] horas contínuas
- [400] fotos selecionadas com tratamento de cor e luz
- [30] fotos com tratamento avançado (retoque de pele e detalhes)
- Galeria online privada para download por [90] dias
- 1 rodada de ajustes na seleção
Não incluso: arquivos brutos (RAW), álbum impresso, vídeo, segundo fotógrafo, transporte fora de [cidade].

3. PRAZO
Prévia com [15] fotos em até [5] dias úteis.
Entrega final em até [30] dias úteis após o evento.

4. VALORES
Cobertura ([8]h) ................. R$ [x]
Tratamento e edição ............. R$ [x]
Deslocamento .................... R$ [x]
TOTAL ........................... R$ [x]
Hora extra no dia: R$ [x]/hora, cobrada após a conclusão.
Segundo fotógrafo (opcional): R$ [x]

5. CONDIÇÕES DE PAGAMENTO
[30]% para reserva da data (não reembolsável) e [70]% até [x] dias antes do evento. PIX: [sua chave].
A data só é bloqueada na agenda após o pagamento da reserva.

6. DIREITOS DE USO
Cliente pode usar as imagens para [uso pessoal e redes sociais próprias], sem prazo. Uso comercial, campanha paga ou cessão a terceiros: orçado à parte.
O fotógrafo pode usar as imagens em portfólio e redes, salvo pedido de restrição por escrito.

7. ACEITE
Para aprovar, confirme por escrito ou pelo link enviado. Cancelamento com menos de [15] dias: valor da reserva retido.`,
  extras: [
    { item: 'Hora extra', how: 'Valor por hora definido no orçamento e cobrado depois do evento, sem negociação no dia.' },
    { item: 'Deslocamento e diária', how: 'Fora da cidade: transporte, hospedagem e diária de deslocamento à parte.' },
    { item: 'Segundo fotógrafo / assistente', how: 'Cobertura de dois ângulos exige equipe; nunca "cabe" no mesmo valor.' },
    { item: 'Arquivos brutos (RAW)', how: 'Se for entregar, cobre à parte — é seu material de trabalho, não o produto.' },
    { item: 'Rodada extra de tratamento', how: 'Uma rodada inclusa; as seguintes com valor fixo por rodada.' },
    { item: 'Álbum, impressão e vídeo', how: 'Produto de terceiro com custo próprio; orçamento separado.' },
  ],
  faq: [
    {
      q: 'Como cobrar por um ensaio ou evento fotográfico?',
      a: 'Precifique por entrega, não por clique: horas de cobertura + número de fotos tratadas + prazo. Considere o tempo de edição (que costuma ser maior que o do evento), custo de equipamento, deslocamento e sua meta mensal de faturamento.',
    },
    {
      q: 'Devo pedir sinal para reservar a data?',
      a: 'Sim. Reserva sem sinal é agenda bloqueada de graça. O padrão do mercado é 30% não reembolsável no aceite, exatamente como está no modelo.',
    },
    {
      q: 'Preciso entregar todas as fotos do evento?',
      a: 'Não, e é melhor deixar isso explícito. Você entrega uma quantidade selecionada e tratada. "Todas as fotos" inclui foto fora de foco e olho fechado, o que prejudica seu próprio trabalho.',
    },
    {
      q: 'Como tratar direitos de uso da imagem?',
      a: 'Separe uso pessoal de uso comercial. Cliente que vai rodar campanha paga ou usar em material de marca deve pagar pela cessão — é uma linha no orçamento, não um favor.',
    },
    {
      q: 'O que fazer se o cliente cancelar?',
      a: 'Defina a política antes: valor da reserva retido e prazo mínimo para remarcação. Com isso por escrito no orçamento, cancelamento deixa de ser discussão.',
    },
  ],
};
