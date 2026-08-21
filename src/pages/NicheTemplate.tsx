import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, ArrowRight, FileText, icons } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { useToast } from '@/hooks/use-toast';
import { NICHES, getNiche, nichePath } from '@/content/niches';
import NotFound from '@/pages/NotFound';

export default function NicheTemplate() {
  const { nicho } = useParams<{ nicho: string }>();
  const niche = getNiche(nicho);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!niche) return <NotFound />;

  const NicheIcon = icons[niche.icon as keyof typeof icons] ?? FileText;
  const accent = `hsl(var(--${niche.accentColor}))`;


  const copy = async () => {
    try {
      await navigator.clipboard.writeText(niche.template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Não foi possível copiar',
        description: 'Selecione o texto e copie manualmente.',
        variant: 'destructive',
      });
    }
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: niche.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const others = NICHES.filter((n) => n.slug !== niche.slug);

  return (
    <div className="min-h-screen bg-background">
      <Seo title={niche.seoTitle} description={niche.seoDescription} path={nichePath(niche.slug)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">Orca</Link>
          <Button size="sm" asChild>
            <Link to={`/register?modelo=${niche.slug}`}>Criar orçamento grátis</Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <header className="space-y-4">
          <figure className="space-y-2">
            <div className="relative overflow-hidden rounded-xl h-[280px] sm:h-[320px]">
              <img
                src={`${niche.heroImage.url}?auto=format&fit=crop&w=1600&q=80`}
                alt={niche.heroImage.alt}
                loading="eager"
                width={1600}
                height={640}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/30" aria-hidden />
              <span
                className="absolute left-0 top-0 h-1.5 w-full"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
            </div>
            <figcaption className="text-xs text-muted-foreground">
              Foto de{' '}
              <a
                href={`${niche.heroImage.credit.profileUrl}?utm_source=orca&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {niche.heroImage.credit.name}
              </a>{' '}
              no{' '}
              <a
                href="https://unsplash.com?utm_source=orca&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Unsplash
              </a>
            </figcaption>
          </figure>

          <p className="text-sm text-muted-foreground">
            <Link to="/modelos-de-proposta-comercial" className="hover:text-foreground underline underline-offset-4">
              Modelos de proposta comercial
            </Link>{' '}
            · {niche.label}
          </p>
          <div className="flex items-start gap-3">
            <span
              className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `hsl(var(--${niche.accentColor}) / 0.12)`, color: accent }}
              aria-hidden
            >
              <NicheIcon className="h-6 w-6" />
            </span>
            <h1 className="text-4xl font-bold tracking-tight">{niche.h1}</h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">{niche.intro}</p>
        </header>

        <section className="space-y-5" aria-labelledby="essenciais">
          <h2 id="essenciais" className="text-2xl font-semibold tracking-tight">
            O que não pode faltar nesse orçamento
          </h2>
          <ul className="space-y-2">
            {niche.essentials.map((e) => (
              <li key={e} className="flex gap-3 text-muted-foreground">
                <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: accent }} aria-hidden />
                <span className="leading-relaxed">{e}</span>
              </li>
            ))}
          </ul>
        </section>


        <section className="space-y-5" aria-labelledby="modelo">
          <h2 id="modelo" className="text-2xl font-semibold tracking-tight">Modelo pronto para copiar</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
                {niche.h1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed font-mono overflow-x-auto">
                {niche.template}
              </pre>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={copy}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? 'Copiado' : 'Copiar modelo'}
                </Button>
                <Button asChild>
                  <Link to={`/register?modelo=${niche.slug}`}>
                    Usar este modelo no Orca
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5" aria-labelledby="extras">
          <h2 id="extras" className="text-2xl font-semibold tracking-tight">
            O que costuma ser cobrado à parte
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th scope="col" className="text-left font-semibold p-3">Item</th>
                  <th scope="col" className="text-left font-semibold p-3">Como tratar no orçamento</th>
                </tr>
              </thead>
              <tbody>
                {niche.extras.map((x) => (
                  <tr key={x.item} className="border-t align-top">
                    <td className="p-3 font-medium whitespace-nowrap">{x.item}</td>
                    <td className="p-3 text-muted-foreground leading-relaxed">{x.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <div className="space-y-5">
            {niche.faq.map((f) => (
              <div key={f.q} className="space-y-1">
                <h3 className="font-semibold">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-muted/40 p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Envie esse orçamento em 2 minutos</h2>
          <p className="text-muted-foreground">
            No Orca você monta o orçamento com seus itens salvos, envia um link pelo WhatsApp com QR Code
            PIX, recebe o aceite e vê a hora em que o cliente abriu.
          </p>
          <Button size="lg" asChild>
            <Link to={`/register?modelo=${niche.slug}`}>Começar grátis</Link>
          </Button>
        </section>

        <section className="space-y-4" aria-labelledby="outros">
          <h2 id="outros" className="text-2xl font-semibold tracking-tight">Modelos para outras profissões</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((n) => (
              <Link
                key={n.slug}
                to={nichePath(n.slug)}
                className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold">{n.h1}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span className="opacity-30">·</span>
          <Link to="/modelos-de-proposta-comercial" className="hover:text-foreground">Modelos de proposta</Link>
          <span className="opacity-30">·</span>
          <Link to="/pricing" className="hover:text-foreground">Planos</Link>
          <span className="opacity-30">·</span>
          <Link to="/ebook" className="hover:text-foreground">E-book gratuito</Link>
        </div>
      </footer>
    </div>
  );
}
