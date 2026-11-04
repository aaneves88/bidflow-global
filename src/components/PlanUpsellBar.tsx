import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'orca:plan-upsell-dismissed-at';
export const UPSELL_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

/** Hidden if dismissed less than 3 days ago — unless the user is near/at the limit. */
export function shouldShowUpsell(dismissedAt: number | null, now: number, nearLimit: boolean) {
  if (nearLimit) return true;
  if (!dismissedAt) return true;
  return now - dismissedAt >= UPSELL_SNOOZE_MS;
}

/** Floating bar for free users suggesting Premium. Dismissible for 3 days. */
export function PlanUpsellBar() {
  const { t } = useTranslation('common');
  const { isAdmin } = useAuth();
  const sub = useSubscription();
  const [dismissedAt, setDismissedAt] = useState<number | null>(() => {
    try { const v = localStorage.getItem(STORAGE_KEY); return v ? Number(v) : null; } catch { return null; }
  });

  if (isAdmin || !sub.isReady || sub.hasActivePlan || sub.proposalsUnlimited) return null;
  const max = sub.maxProposals ?? 0;
  const used = sub.proposalsUsed;
  const nearLimit = max > 0 && used >= max - 1;
  if (!shouldShowUpsell(dismissedAt, Date.now(), nearLimit)) return null;

  const dismiss = () => {
    const now = Date.now();
    try { localStorage.setItem(STORAGE_KEY, String(now)); } catch { /* ignore */ }
    setDismissedAt(now);
  };

  const message = sub.proposalLimitReached
    ? t('planUpsell.reached', { max })
    : t('planUpsell.usage', { used, max });

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 pb-safe">
      <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-card/95 px-3 py-2 shadow-lg backdrop-blur">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <p className="flex-1 text-xs sm:text-sm text-foreground">{message}</p>
        <Button size="sm" asChild>
          <Link to="/app/planos">{t('planUpsell.cta')}</Link>
        </Button>
        {!nearLimit && (
          <button type="button" onClick={dismiss} aria-label={t('planUpsell.dismiss')}
            className="rounded p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
