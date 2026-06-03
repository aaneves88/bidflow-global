import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LegalFooter } from '@/components/LegalFooter';
import { FileText, BarChart3, Send, CheckCircle, ArrowRight, Zap } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">CloseFlow</span>
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
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-3">
          <LegalFooter />
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} CloseFlow. {t('footer.rights')}</span>
        </div>
      </footer>
    </div>
  );
}
