import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import orcaMark from '@/assets/brand/orca-mark.png';

export default function Privacy() {
  const { t } = useTranslation('privacy');
  const sections = t('sections', { returnObjects: true }) as Array<{ heading: string; body: string }>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={orcaMark} alt="Orca" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">Orca</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t('back')}</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <article className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
            <p className="text-sm text-muted-foreground">{t('lastUpdated')}</p>
          </header>

          <p className="text-base leading-relaxed text-foreground/90">{t('intro')}</p>

          <div className="space-y-8">
            {Array.isArray(sections) && sections.map((s, i) => (
              <section key={i} className="space-y-2">
                <h2 className="text-xl font-semibold">{s.heading}</h2>
                <p className="text-base text-muted-foreground whitespace-pre-line leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>
        </article>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link to="/legal/terms" className="hover:text-foreground">Termos de Uso</Link>
            <span className="opacity-30">·</span>
            <Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link>
            <span className="opacity-30">·</span>
            <Link to="/legal/cookies" className="hover:text-foreground">Política de Cookies</Link>
          </div>
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Orca. {t('footerRights')}</span>
        </div>
      </footer>
    </div>
  );
}
