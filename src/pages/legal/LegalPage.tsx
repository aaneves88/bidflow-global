import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type LegalDoc = 'terms' | 'privacy' | 'cookies';

const VALID_DOCS: LegalDoc[] = ['terms', 'privacy', 'cookies'];

export default function LegalPage() {
  const { doc } = useParams<{ doc: string }>();
  const { t } = useTranslation('legal');

  if (!doc || !VALID_DOCS.includes(doc as LegalDoc)) {
    return <Navigate to="/legal/terms" replace />;
  }

  const { data: settings } = useQuery({
    queryKey: ['legal-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['legal_company_name', 'legal_contact_email', 'company_name']);
      const map: Record<string, any> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  const companyName = settings?.legal_company_name || settings?.company_name || 'Orca';
  const contactEmail = settings?.legal_contact_email || 'contato@closeflow.app';
  const year = new Date().getFullYear();

  const sections = t(`${doc}.sections`, { returnObjects: true, company: companyName, email: contactEmail, year }) as Array<{ heading: string; body: string }>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">Orca</Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t('back')}</Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight">{t(`${doc}.title`)}</h1>
          <p className="text-muted-foreground mt-2">{t(`${doc}.subtitle`, { company: companyName })}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('lastUpdated', { date: '2026-06-03' })}</p>
        </header>

        <div className="space-y-6">
          {Array.isArray(sections) && sections.map((s, i) => (
            <section key={i} className="space-y-2">
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <footer className="pt-8 border-t flex flex-wrap gap-4 text-sm">
          <Link to="/legal/terms" className="text-muted-foreground hover:text-foreground">{t('terms.title')}</Link>
          <Link to="/legal/privacy" className="text-muted-foreground hover:text-foreground">{t('privacy.title')}</Link>
          <Link to="/legal/cookies" className="text-muted-foreground hover:text-foreground">{t('cookies.title')}</Link>
        </footer>
      </div>
    </div>
  );
}
