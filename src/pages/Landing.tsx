import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LegalFooter } from '@/components/LegalFooter';
import { FileText, BarChart3, Send, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import orcaMark from '@/assets/brand/orca-mark.png';

export default function Landing() {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

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

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={orcaMark} alt="Orca" className="h-8 w-8 object-contain" />
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

          {/* Mockup do app */}
          <div className="mt-16 max-w-lg mx-auto">
            <div className="rounded-2xl border-2 border-primary/20 shadow-2xl overflow-hidden bg-card">
              <div className="bg-primary/5 px-4 py-3 border-b flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted-foreground">orca-mento.app</span>
              </div>
              <div className="p-6 space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{t('mockup.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('mockup.client')}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{t('mockup.approved')}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span>{t('mockup.item1')}</span>
                    <span className="font-medium">{t('mockup.item1Value')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>{t('mockup.item2')}</span>
                    <span className="font-medium">{t('mockup.item2Value')}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold">{t('mockup.total')}</span>
                  <span className="font-bold text-green-600 text-lg">{t('mockup.totalValue')}</span>
                </div>
              </div>
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

      {/* Pricing */}
      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('pricing.heading')}</h2>
            <p className="mt-4 text-muted-foreground text-lg">{t('pricing.subheading')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="font-bold text-xl">{t('pricing.free.name')}</h3>
              <p className="text-muted-foreground text-sm">{t('pricing.free.description')}</p>
              <p className="text-3xl font-bold">
                {t('pricing.free.price')}
                <span className="text-base font-normal text-muted-foreground">{t('pricing.perMonth')}</span>
              </p>
              <ul className="space-y-2 text-sm">
                {(['f1', 'f2', 'f3', 'f4'] as const).map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t(`pricing.free.features.${k}`)}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register">{t('pricing.free.cta')}</Link>
              </Button>
            </div>

            {/* Starter */}
            <div className="rounded-xl border-2 border-primary bg-card p-6 space-y-4 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                {t('pricing.popular')}
              </span>
              <h3 className="font-bold text-xl">{t('pricing.starter.name')}</h3>
              <p className="text-muted-foreground text-sm">{t('pricing.starter.description')}</p>
              <p className="text-3xl font-bold">
                {t('pricing.starter.price')}
                <span className="text-base font-normal text-muted-foreground">{t('pricing.starter.priceCents')}</span>
              </p>
              <ul className="space-y-2 text-sm">
                {(['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const).map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t(`pricing.starter.features.${k}`)}
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link to="/register">{t('pricing.starter.cta')}</Link>
              </Button>
            </div>

            {/* Pro */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="font-bold text-xl">{t('pricing.pro.name')}</h3>
              <p className="text-muted-foreground text-sm">{t('pricing.pro.description')}</p>
              <p className="text-3xl font-bold">
                {t('pricing.pro.price')}
                <span className="text-base font-normal text-muted-foreground">{t('pricing.pro.priceCents')}</span>
              </p>
              <ul className="space-y-2 text-sm">
                {(['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const).map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t(`pricing.pro.features.${k}`)}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register">{t('pricing.pro.cta')}</Link>
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
          <LegalFooter />
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Orca. {t('footer.rights')}</span>
        </div>
      </footer>
    </div>
  );
}
