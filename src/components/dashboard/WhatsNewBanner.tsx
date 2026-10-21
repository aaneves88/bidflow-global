import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CreditCard, BookOpen, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const KEY = 'orca:whatsnew:novidades-pagamento-ajuda';

export function WhatsNewBanner() {
  const { t } = useTranslation('dashboard');
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
  });
  if (hidden) return null;

  const close = () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    setHidden(true);
  };

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="relative space-y-4 p-5">
        <button
          type="button"
          onClick={close}
          aria-label={t('whatsNew.close')}
          className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="flex items-center gap-2 pr-8 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          {t('whatsNew.title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-medium">
              <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('whatsNew.payment.title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('whatsNew.payment.body')}</p>
            <Button asChild size="sm" variant="outline"><Link to="/account">{t('whatsNew.payment.cta')}</Link></Button>
          </div>
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-medium">
              <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('whatsNew.help.title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('whatsNew.help.body')}</p>
            <Button asChild size="sm" variant="outline"><Link to="/ajuda">{t('whatsNew.help.cta')}</Link></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
