import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Palette } from 'lucide-react';
import { useCanCustomBrand } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'orca:brand-upsell-dismissed';

/**
 * Discreet, persistent nudge for free users: own brand is a paid feature.
 * Compact pill anchored bottom-right so it never covers in-flow page actions.
 * Dismissible — stays dismissed via localStorage.
 */
export function BrandUpsellBanner() {
  const { t } = useTranslation('common');
  const canCustomBrand = useCanCustomBrand();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (canCustomBrand || dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm pb-safe">
      <div className="flex items-center gap-2 rounded-lg border bg-card/95 px-3 py-2 shadow-lg backdrop-blur">
        <Palette className="h-4 w-4 shrink-0 text-primary" />
        <p className="flex-1 text-xs text-muted-foreground">
          {t('brandUpsell.message')}
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link to="/pricing">{t('brandUpsell.cta')}</Link>
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('brandUpsell.dismiss')}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
