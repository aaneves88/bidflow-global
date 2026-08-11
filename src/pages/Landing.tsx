import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LegalFooter } from '@/components/LegalFooter';
import { FileText, BarChart3, Send, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import orcaMark from '@/assets/brand/orca-mark-sm.png';
import { usePlans } from '@/hooks/usePlans';
import { formatCurrency } from '@/lib/format';
import { isUnlimited } from '@/lib/planLimits';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Seo } from '@/components/Seo';


export default function Landing() {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);
    if (isStandalone || isMobile) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);


  const features = [
    { icon: FileText, key: 'create' },
    { icon: Send, key: 'share' },
    { icon: BarChart3, key: 'track' },
    { icon: CheckCircle, key: 'close' },
  ] as const;

  const steps = ['one', 'two', 'three'] as const;

  const brazilianItems = ['pix', 'whatsapp', 'accept', 'brl'] as const;

  // Galeria dinâmica: novas capturas em public/marketing/ aparecem sem alterar código.
  const captionKeys: Record<string, string> = {
    dashboard: 'dashboard',
    lista: 'list',
    editar: 'edit',
    publica: 'public',
  };
  const screenshots = Object.keys(
    import.meta.glob('/public/marketing/mobile-*.{png,jpg,jpeg,webp}')
  )
    .sort()
    .map((path) => {
      const file = path.split('/').pop() ?? path;
      const matchKey = Object.keys(captionKeys).find((k) => file.includes(k));
      return {
        src: path.replace(/^\/public/, ''),
        caption: matchKey ? t(`screenshots.items.${captionKeys[matchKey]}`) : file.replace(/\.\w+$/, ''),
      };
    });

  const faqItems = ['card', 'clientAccount', 'mobile', 'limit', 'pix'] as const;

  // Preços e limites vêm do banco (mesma fonte da página /pricing) para nunca divergirem.
  const { plans } = usePlans();
  const freePlan = plans.find((p) => p.is_starter);
  const premiumPlan = plans.find((p) => !p.is_starter);
  const priceOf = (price?: number | null, currency?: string | null, fallback?: string) =>
    typeof price === 'number' ? formatCurrency(price, currency || undefined) : fallback ?? '';

  const planFeatures = (plan?: typeof plans[number]) => {
    if (!plan) return [] as string[];
    const list = [
      isUnlimited(plan.max_proposals)
        ? t('pricing.limits.proposalsUnlimited')
        : t('pricing.limits.proposals', { count: plan.max_proposals as number }),
      isUnlimited(plan.max_clients)
        ? t('pricing.limits.clientsUnlimited')
        : t('pricing.limits.clients', { count: plan.max_clients as number }),
      t('pricing.limits.publicLink'),
      t('pricing.limits.pix'),
    ];
    if (plan.allow_pdf_export) list.push(t('pricing.limits.pdf'));
    if (plan.allow_templates) list.push(t('pricing.limits.templates'));
    if (plan.allow_custom_branding) list.push(t('pricing.limits.branding'));
    return list;
  };



  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={orcaMark} alt="Orca — propostas e orçamentos" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">Orca</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/pricing">{t('common:nav.pricing')}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/login">{t('common:nav.signIn')}</Link>
            </Button>
            <Button asChild>
              <Link to="/register">{t('common:nav.getStarted')}</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Zap className="h-3.5 w-3.5" />
            {t('tagline')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            {t('hero.title1')}<br />
            {t('hero.title2')}<br />
            <span className="text-primary">{t('hero.title3')}</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8" asChild>
              <Link to="/register">
                {t('hero.ctaPrimary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <Link to="/login">{t('hero.ctaSecondary')}</Link>
            </Button>
          </div>

          {/* Captura real do produto */}
          <div className="mt-16 max-w-xs sm:max-w-sm mx-auto">
            <div className="rounded-[2rem] border-8 border-foreground/90 bg-foreground/90 shadow-2xl overflow-hidden">
              <img
                src="/marketing/mobile-01-dashboard.png"
                alt={t('screenshots.items.dashboard')}
                width={1080}
                height={1920}
                className="w-full h-auto rounded-[1.4rem] bg-background"
              />
            </div>
          </div>

        </div>
      </section>

      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t('features.heading')}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('features.subheading')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.key} className="rounded-xl border bg-card p-6 space-y-3">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{t(`features.items.${f.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.items.${f.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferencial brasileiro */}
      <section className="py-20 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t('brazilian.heading')}</h2>
              <p className="mt-4 text-muted-foreground text-lg">{t('brazilian.subheading')}</p>
              <ul className="mt-6 space-y-4">
                {brazilianItems.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <strong>{t(`brazilian.items.${key}.title`)}</strong>
                      <p className="text-sm text-muted-foreground">{t(`brazilian.items.${key}.description`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="w-72 rounded-3xl border-4 border-gray-800 p-2 bg-gray-800 shadow-xl">
                <div className="rounded-2xl overflow-hidden bg-white">
                  <div className="bg-green-600 px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-400" />
                    <div>
                      <p className="text-white text-sm font-medium">{t('brazilian.chat.name')}</p>
                      <p className="text-green-200 text-xs">{t('brazilian.chat.status')}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 min-h-[200px]">
                    <div className="bg-white border rounded-lg p-3 max-w-[85%] shadow-sm">
                      <p className="text-sm text-gray-900">{t('brazilian.chat.message')}</p>
                      <a className="text-sm text-blue-600 underline block mt-1">{t('brazilian.chat.link')}</a>
                      <p className="text-sm mt-1 font-medium text-gray-900">{t('brazilian.chat.value')}</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3 max-w-[70%] ml-auto shadow-sm">
                      <p className="text-sm text-gray-900">{t('brazilian.chat.approved')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('how.heading')}</h2>
            <p className="mt-4 text-muted-foreground text-lg">{t('how.subheading')}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((key, idx) => (
              <div key={key} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-lg">{t(`how.steps.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`how.steps.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capturas reais do produto */}
      <section className="py-20 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('screenshots.heading')}</h2>
            <p className="mt-4 text-muted-foreground text-lg">{t('screenshots.subheading')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {screenshots.map((s) => (
              <figure key={s.src} className="space-y-3">
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                  <img
                    src={s.src}
                    alt={s.caption}
                    loading="lazy"
                    width={1080}
                    height={1920}
                    className="w-full h-auto"
                  />
                </div>
                <figcaption className="text-sm text-muted-foreground text-center">
                  {s.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>


      {/* Pricing */}
      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('pricing.heading')}</h2>
            <p className="mt-4 text-muted-foreground text-lg">{t('pricing.subheading')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="font-bold text-xl">{freePlan?.name ?? t('pricing.free.name')}</h3>
              <p className="text-muted-foreground text-sm">{t('pricing.free.description')}</p>
              <p className="text-3xl font-bold">
                {priceOf(freePlan?.price ?? 0, freePlan?.currency, t('pricing.free.price'))}
                <span className="text-base font-normal text-muted-foreground">{t('pricing.perMonth')}</span>
              </p>
              <ul className="space-y-2 text-sm">
                {planFeatures(freePlan).map((label) => (
                  <li key={label} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {label}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register">{t('pricing.free.cta')}</Link>
              </Button>
            </div>

            {/* Premium */}
            <div className="rounded-xl border-2 border-primary bg-card p-6 space-y-4 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                {t('pricing.recommended')}
              </span>
              <h3 className="font-bold text-xl">{premiumPlan?.name ?? t('pricing.premium.name')}</h3>
              <p className="text-muted-foreground text-sm">{t('pricing.premium.description')}</p>
              <p className="text-3xl font-bold">
                {priceOf(premiumPlan?.price, premiumPlan?.currency, t('pricing.premium.priceMonthly'))}
                <span className="text-base font-normal text-muted-foreground">{t('pricing.perMonth')}</span>
              </p>
              <ul className="space-y-2 text-sm">
                {planFeatures(premiumPlan).map((label) => (
                  <li key={label} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {label}
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link to="/register">{t('pricing.premium.cta')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Prova social */}
      <section className="py-16 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-primary">{t('stats.time')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('stats.timeLabel')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{t('stats.online')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('stats.onlineLabel')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{t('stats.price')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('stats.priceLabel')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dúvidas frequentes */}
      <section className="py-20 border-t">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('faq.heading')}</h2>
            <p className="mt-4 text-muted-foreground text-lg">{t('faq.subheading')}</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-left">{t(`faq.items.${key}.q`)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {t(`faq.items.${key}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>


      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t('cta.heading')}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {t('cta.subheading')}
          </p>
          <div className="mt-8">
            <Button size="lg" className="text-base px-8" asChild>
              <Link to="/register">
                {t('cta.button')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link to="/legal/terms" className="hover:text-foreground">Termos de Uso</Link>
            <span className="opacity-30">·</span>
            <Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link>
            <span className="opacity-30">·</span>
            <Link to="/legal/cookies" className="hover:text-foreground">Política de Cookies</Link>
          </div>
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Orca. {t('footer.rights')}</span>
        </div>
      </footer>
    </div>
  );
}
