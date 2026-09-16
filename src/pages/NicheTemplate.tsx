import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { captureNicheOrigin } from '@/lib/attribution';
import { trackProductEvent } from '@/lib/productEvents';
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

  useEffect(() => {
    if (!niche) return;
    captureNicheOrigin(niche.slug);
    void trackProductEvent('niche_page_viewed', null, { niche: niche.slug });
  }, [niche?.slug]);

  if (!niche) return <NotFound />;

  const NicheIcon = icons[niche.icon as keyof typeof icons] ?? FileText;
  const accent = `hsl(var(--${niche.accentColor}))`;
  const accentSoft = `hsl(var(--${niche.accentColor}) / 0.14)`;
  const onAccent = 'hsl(var(--primary-foreground))';

  const trackCta = (position: 'topo' | 'modelo' | 'rodape') => {
    void trackProductEvent('niche_cta_clicked', null, { niche: niche.slug, position });
  };

  const copy = async () => {
    void trackProductEvent('niche_template_copied', null, { niche: niche.slug });
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
          <Button size="sm" className="min-h-11" asChild>
            <Link to={`/register?modelo=${niche.slug}`}>Criar orçamento grátis</Link>
          </Button>
        </div>
      </nav>

      {/* HERO — bloco de cor cheio, full-width */}
      <header
        className="relative overflow-hidden"
        style={{ backgroundColor: 'hsl(var(--niche-hero))', color: 'hsl(var(--niche-hero-foreground))' }}
      >
        <img
          src={`${niche.heroImage.url}?auto=format&fit=crop&w=1600&q=80`}
          alt={niche.heroImage.alt}
          loading="eager"
          width={1600}
          height={640}
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, hsl(var(--niche-hero) / 0.92), hsl(var(--${niche.accentColor}) / 0.35))`,
          }}
          aria-hidden
        />
        <span className="absolute left-0 top-0 h-1.5 w-full" style={{ backgroundColor: accent }} aria-hidden />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-6">
          <p className="text-sm opacity-80">
            <Link to="/modelos-de-proposta-comercial" className="underline underline-offset-4 hover:opacity-100">
              Modelos de proposta comercial
            </Link>{' '}
            · {niche.label}
          </p>

          <div className="flex items-center gap-4">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: accent, color: onAccent }}
              aria-hidden
            >
              <NicheIcon className="h-8 w-8" />
            </span>
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: accentSoft, color: accent }}
            >
              Modelo grátis · {niche.label}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            {niche.h1}
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl opacity-90">{niche.intro}</p>

          <p className="text-xs opacity-60">
            Foto de{' '}
            <a
              href={`${niche.heroImage.credit.profileUrl}?utm_source=orca&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {niche.heroImage.credit.name}
            </a>{' '}
            no{' '}
            <a
              href="https://unsplash.com?utm_source=orca&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Unsplash
            </a>
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        <section className="space-y-5" aria-labelledby="essenciais">
          <h2 id="essenciais" className="text-2xl font-semibold tracking-tight">
            O que não pode faltar nesse orçamento
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {niche.essentials.map((e) => (
              <li
                key={e}
                className="flex gap-3 rounded-lg border border-l-4 bg-card p-4"
                style={{ borderLeftColor: accent }}
              >
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: accent, color: onAccent }}
                  aria-hidden
                >
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed text-foreground/80">{e}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-5" aria-labelledby="modelo">
          <h2 id="modelo" className="text-2xl font-semibold tracking-tight">Modelo pronto para copiar</h2>
          <Card className="overflow-hidden">
            <CardHeader style={{ backgroundColor: accent, color: onAccent }}>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" aria-hidden />
                {niche.h1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <pre
                className="whitespace-pre-wrap rounded-lg border p-5 text-sm leading-relaxed font-mono overflow-x-auto shadow-sm"
                style={{ backgroundColor: 'hsl(var(--paper))', color: 'hsl(var(--paper-foreground))' }}
              >
                {niche.template}
              </pre>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="min-h-11" onClick={copy}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? 'Copiado' : 'Copiar modelo'}
                </Button>
                <Button asChild className="min-h-11" style={{ backgroundColor: accent, color: onAccent }}>
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
          <ul className="grid gap-3 sm:grid-cols-2">
            {niche.extras.map((x) => (
              <li
                key={x.item}
                className="rounded-lg border border-l-4 bg-card p-4 space-y-1.5"
                style={{ borderLeftColor: accent }}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
                  {x.item}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{x.how}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <div className="space-y-5">
            {niche.faq.map((f) => (
              <div key={f.q} className="space-y-1 border-l-2 pl-4" style={{ borderLeftColor: accentSoft }}>
                <h3 className="font-semibold">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CTA — ponto mais forte da página, full-width */}
      <section className="relative" style={{ backgroundColor: accent, color: onAccent }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Envie esse orçamento em 2 minutos</h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg opacity-90 leading-relaxed">
            No Orca você monta o orçamento com seus itens salvos, envia um link pelo WhatsApp com QR Code
            PIX, recebe o aceite e vê a hora em que o cliente abriu.
          </p>
          <Button
            size="lg"
            asChild
            className="min-h-12 text-base font-semibold shadow-lg hover:opacity-90"
            style={{ backgroundColor: 'hsl(var(--niche-hero))', color: 'hsl(var(--niche-hero-foreground))' }}
          >
            <Link to={`/register?modelo=${niche.slug}`}>
              Começar grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4" aria-labelledby="outros">
        <h2 id="outros" className="text-2xl font-semibold tracking-tight">Modelos para outras profissões</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {others.map((n) => (
            <Link
              key={n.slug}
              to={nichePath(n.slug)}
              className="flex items-center gap-3 rounded-lg border border-l-4 p-4 min-h-16 hover:bg-muted/50 transition-colors"
              style={{ borderLeftColor: `hsl(var(--${n.accentColor}))` }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: `hsl(var(--${n.accentColor}))` }}
                aria-hidden
              />
              <span className="font-semibold">{n.h1}</span>
            </Link>
          ))}
        </div>
      </section>

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
