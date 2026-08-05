import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gauge, Infinity as InfinityIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { usagePercent } from '@/lib/planLimits';

interface Props {
  variant?: 'card' | 'banner';
}

export function UsageIndicator({ variant = 'card' }: Props) {
  const { t } = useTranslation('common');
  const { isAdmin } = useAuth();
  const limits = useSubscription();

  if (isAdmin || limits.isLoading) return null;

  const used = limits.proposalsUsed;
  const unlimited = limits.proposalsUnlimited;

  const icon = unlimited
    ? <InfinityIcon className="h-5 w-5 text-primary" />
    : <Gauge className="h-5 w-5 text-primary" />;

  const max = limits.maxProposals as number;
  const title = unlimited
    ? t('usage.unlimited')
    : t('usage.planUsage', { used, max });
  const subtitle = unlimited
    ? t('usage.unlimitedHint', { used })
    : limits.proposalLimitReached
      ? t('usage.planLimitReached')
      : t('usage.planRemaining', { remaining: max - used });

  // Barra só existe para limite finito — nunca renderizar progresso de "-1".
  const showProgress = !unlimited;
  const progress = usagePercent(used, limits.maxProposals);
  const showCta = !unlimited && limits.proposalLimitReached;

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
    return <div className="rounded-lg border bg-card p-3">{content}</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6">{content}</CardContent>
    </Card>
  );
}
