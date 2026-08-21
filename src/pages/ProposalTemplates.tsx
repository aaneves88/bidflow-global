import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Check, ArrowRight, FileText } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { useToast } from '@/hooks/use-toast';
import { NICHES, nichePath } from '@/content/niches';

type Template = {
  id: string;
  area: string;
  title: string;
  summary: string;
  body: string;
};

const STRUCTURE = [
  {
    heading: '1. Capa e identificação',
    body: 'Nome do seu negócio, nome do cliente, número/título da proposta e data de emissão. É o que dá a primeira impressão de profissionalismo.',
  },
  {
    heading: '2. Entendimento do problema',
    body: 'Em 3 a 5 linhas, mostre que você entendeu o que o cliente precisa, com as palavras dele. Propostas que começam pelo problema fecham mais do que as que começam pelo preço.',
  },
  {
    heading: '3. Escopo do que será entregue',
    body: 'Lista objetiva de entregáveis, com quantidades. Deixe explícito o que NÃO está incluído — é o que evita retrabalho não pago.',
  },
  {
    heading: '4. Prazo e etapas',
    body: 'Datas ou janelas por etapa (descoberta, produção, revisão, entrega). Amarre o prazo ao aceite: "prazo contado a partir da aprovação".',
  },
  {
    heading: '5. Investimento',
    body: 'Valor por item e total. Se houver desconto, mostre o valor cheio e o desconto separados — o cliente precisa enxergar a concessão.',
  },
  {
    heading: '6. Condições de pagamento',
    body: 'Forma (PIX, boleto, cartão), parcelamento, sinal e o que acontece em caso de atraso. Chave PIX visível reduz o atrito na hora do sim.',
  },
  {
    heading: '7. Validade e aceite',
    body: 'Data de validade da proposta e como aceitar (assinatura digital ou confirmação por escrito). Validade curta cria urgência real.',
  },
];

const TEMPLATES: Template[] = [
  {
    id: 'consultoria',
    area: 'Consultoria',
    title: 'Modelo de proposta comercial para consultoria',
    summary: 'Projeto por etapas, com diagnóstico pago e plano de ação entregue ao final.',
    body: `PROPOSTA COMERCIAL — CONSULTORIA
Cliente: [Nome do cliente]
Emitida em: [data] | Válida até: [data + 15 dias]

1. ENTENDIMENTO
Durante nossa conversa, identificamos que [problema central do cliente]. Hoje isso gera [impacto: custo, retrabalho, perda de vendas]. Esta proposta descreve como pretendo resolver esse ponto.

2. ESCOPO
- Diagnóstico inicial: entrevistas e leitura dos dados atuais (1 semana)
- Plano de ação priorizado: até 10 recomendações com esforço e impacto
- 2 reuniões de acompanhamento (60 min cada)
Não incluso: execução das recomendações, ferramentas pagas de terceiros.

3. PRAZO
Etapa 1 — Diagnóstico: 5 dias úteis após o aceite
Etapa 2 — Plano de ação: 5 dias úteis após a etapa 1
Etapa 3 — Acompanhamento: até 30 dias após a entrega

4. INVESTIMENTO
Diagnóstico ................ R$ 800,00
Plano de ação .............. R$ 2.500,00
Acompanhamento ............. R$ 600,00
Total ...................... R$ 3.900,00

5. CONDIÇÕES
50% na aprovação (sinal) e 50% na entrega do plano de ação. Pagamento via PIX: [sua chave].

6. ACEITE
Para aprovar, responda a esta proposta confirmando o aceite ou assine no link enviado.`,
  },
  {
    id: 'design',
    area: 'Design',
    title: 'Modelo de proposta comercial para design',
    summary: 'Projeto fechado com rodadas de revisão limitadas — o ponto que mais gera prejuízo quando fica vago.',
    body: `PROPOSTA COMERCIAL — DESIGN
Cliente: [Nome do cliente]
Emitida em: [data] | Válida até: [data + 15 dias]

1. ENTENDIMENTO
Você precisa de [identidade visual / landing page / material de campanha] para [objetivo do cliente], com entrega até [data desejada].

2. ESCOPO
- 1 conceito visual apresentado (não são 3 opções — é 1 caminho defendido)
- Até 2 rodadas de ajustes por peça
- Arquivos finais abertos e exportados (PNG, SVG, PDF)
Não incluso: redação dos textos, compra de fontes ou imagens licenciadas, implementação em site.

3. PRAZO
Apresentação do conceito: 7 dias úteis após o aceite e o envio do briefing completo.
Ajustes: 3 dias úteis por rodada.

4. INVESTIMENTO
Conceito e criação ......... R$ 1.200,00
Aplicações e variações ..... R$ 300,00
Total ...................... R$ 1.500,00
Rodada extra de ajustes: R$ 200,00 cada (fora das 2 inclusas).

5. CONDIÇÕES
40% na aprovação e 60% na entrega dos arquivos finais. PIX: [sua chave].

6. ACEITE
Proposta válida por 15 dias. Após esse prazo, valores e agenda podem mudar.`,
  },
  {
    id: 'marketing',
    area: 'Marketing',
    title: 'Modelo de proposta comercial para marketing',
    summary: 'Contrato recorrente mensal, com escopo por mês e regra clara de reajuste e cancelamento.',
    body: `PROPOSTA COMERCIAL — MARKETING (RECORRENTE)
Cliente: [Nome do cliente]
Emitida em: [data] | Válida até: [data + 10 dias]

1. ENTENDIMENTO
O objetivo é [gerar leads / aumentar vendas / consolidar presença] em [canais]. Hoje a operação [situação atual].

2. ESCOPO MENSAL
- Planejamento e calendário do mês
- 12 publicações (arte + legenda)
- Gestão de campanhas pagas (verba de mídia por conta do cliente)
- Relatório mensal com resultados e próximos passos
Não incluso: verba de mídia, produção audiovisual em locação, assessoria de imprensa.

3. PRAZO E VIGÊNCIA
Contrato mensal recorrente, com renovação automática. Cancelamento com 30 dias de aviso prévio.

4. INVESTIMENTO
Gestão mensal ................ R$ 1.500,00/mês
Suporte e atendimento ........ R$ 400,00/mês
Total ........................ R$ 1.900,00/mês

5. CONDIÇÕES
Cobrança todo dia [X] via PIX ou boleto. Reajuste anual pelo IPCA.

6. ACEITE
Confirme o aceite para iniciarmos no próximo ciclo.`,
  },
];

const FAQ = [
  {
    q: 'O que precisa ter em uma proposta comercial?',
    a: 'Identificação das partes, entendimento do problema, escopo com entregáveis e exclusões, prazo, investimento detalhado, condições de pagamento, validade e forma de aceite. Sem validade e sem exclusões, a proposta vira porta aberta para negociação infinita.',
  },
  {
    q: 'Qual a diferença entre proposta comercial e orçamento?',
    a: 'O orçamento é a parte financeira: itens, quantidades e valores. A proposta comercial envolve o orçamento com contexto — o que você entendeu, o que vai entregar, em quanto tempo e sob quais condições. Na prática, proposta fecha mais que orçamento solto.',
  },
  {
    q: 'Por quanto tempo a proposta deve ficar válida?',
    a: 'Entre 7 e 20 dias na maioria dos serviços. Prazo curto protege seus custos e sua agenda, e cria urgência real sem pressão artificial.',
  },
  {
    q: 'Preciso assinar a proposta?',
    a: 'Aceite por escrito já vale. A assinatura digital no próprio link facilita a prova de aceite e a data exata, o que ajuda em caso de divergência.',
  },
];

export default function ProposalTemplates() {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const copy = async (tpl: Template) => {
    try {
      await navigator.clipboard.writeText(tpl.body);
      setCopied(tpl.id);
      setTimeout(() => setCopied((c) => (c === tpl.id ? null : c)), 2000);
    } catch {
      toast({ title: 'Não foi possível copiar', description: 'Selecione o texto e copie manualmente.', variant: 'destructive' });
    }
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Modelo de proposta comercial: 3 exemplos prontos para copiar"
        description="Modelos de proposta comercial para consultoria, design e marketing. Estrutura completa, textos prontos para copiar e checklist do que não pode faltar."
        path="/modelos-de-proposta-comercial"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">Orca</Link>
          <Button size="sm" asChild>
            <Link to="/register">Criar proposta grátis</Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Modelo de proposta comercial: 3 exemplos prontos</h1>
          <p className="text-lg text-muted-foreground">
            Textos completos de proposta comercial para consultoria, design e marketing — com escopo,
            prazo, investimento e condições de pagamento já escritos. Copie, ajuste os colchetes e envie.
          </p>
        </header>

        <section className="space-y-6" aria-labelledby="estrutura">
          <h2 id="estrutura" className="text-2xl font-semibold tracking-tight">A estrutura que uma proposta precisa ter</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {STRUCTURE.map((s) => (
              <div key={s.heading} className="rounded-lg border p-4 space-y-1">
                <h3 className="font-semibold">{s.heading}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6" aria-labelledby="modelos">
          <h2 id="modelos" className="text-2xl font-semibold tracking-tight">Modelos por área</h2>
          {TEMPLATES.map((tpl) => (
            <Card key={tpl.id} id={tpl.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
                  {tpl.title}
                </CardTitle>
                <CardDescription>{tpl.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed font-mono overflow-x-auto">
                  {tpl.body}
                </pre>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => copy(tpl)}>
                    {copied === tpl.id ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied === tpl.id ? 'Copiado' : 'Copiar modelo'}
                  </Button>
                  <Button asChild>
                    <Link to="/register">
                      Usar este modelo no Orca
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-6" aria-labelledby="profissoes">
          <h2 id="profissoes" className="text-2xl font-semibold tracking-tight">Modelos por profissão</h2>
          <p className="text-muted-foreground">
            Modelos de orçamento com os itens, exclusões e perguntas típicas de cada serviço.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {NICHES.map((n) => (
              <Link
                key={n.slug}
                to={nichePath(n.slug)}
                className="rounded-lg border p-4 space-y-1 hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold block">{n.label}</span>
                <span className="text-sm text-muted-foreground">{n.h1}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q} className="space-y-1">
                <h3 className="font-semibold">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-muted/40 p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Pare de reescrever proposta no Word</h2>
          <p className="text-muted-foreground">
            No Orca você monta a proposta em minutos, envia um link pelo WhatsApp, recebe o aceite
            assinado e ainda vê o momento em que o cliente abriu.
          </p>
          <Button size="lg" asChild>
            <Link to="/register">Começar grátis</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span className="opacity-30">·</span>
          <Link to="/pricing" className="hover:text-foreground">Planos</Link>
          <span className="opacity-30">·</span>
          <Link to="/ebook" className="hover:text-foreground">E-book gratuito</Link>
        </div>
      </footer>
    </div>
  );
}
