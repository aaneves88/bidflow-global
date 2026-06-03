import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Gauge, Infinity as InfinityIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  variant?: 'card' | 'banner';
}

export function UsageIndicator({ variant = 'card' }: Props) {
  const { t } = useTranslation('common');
  const { isAdmin } = useAuth();
  const limits = usePlanLimits();

  if (isAdmin) return null;

  let icon = <Gauge className="h-5 w-5 text-primary" />;
  let title = '';
  let subtitle = '';
  let showProgress = false;
  let progress = 0;
  let showCta = false;

  if (limits.isOnFreeTier) {
    if (!limits.freeProposalUsed) {
      icon = <Sparkles className="h-5 w-5 text-primary" />;
      title = t('usage.freeAvailable');
      subtitle = t('usage.freeAvailableHint');
    } else {
      title = t('usage.freeUsed');
      subtitle = t('usage.freeUsedHint');
      showCta = true;
    }
  } else if (limits.maxProposals === null) {
    icon = <InfinityIcon className="h-5 w-5 text-primary" />;
    title = t('usage.unlimited');
    subtitle = t('usage.unlimitedHint', { used: limits.proposalsUsed });
  } else {
    const used = limits.proposalsUsed;
    const max = limits.maxProposals;
    progress = Math.min(100, (used / max) * 100);
    showProgress = true;
    title = t('usage.planUsage', { used, max });
    subtitle = used >= max ? t('usage.planLimitReached') : t('usage.planRemaining', { remaining: max - used });
    showCta = used >= max;
  }

  const content = (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {showProgress && <Progress value={progress} className="mt-2 h-1.5" />}
      </div>
      {showCta && (
        <Button size="sm" asChild>
          <Link to="/pricing">{t('upgradeModal.viewPlans')}</Link>
        </Button>
      )}
    </div>
  );

  if (variant === 'banner') {
    return (
      <div className="rounded-lg border bg-card p-3">
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">{content}</CardContent>
    </Card>
  );
}
