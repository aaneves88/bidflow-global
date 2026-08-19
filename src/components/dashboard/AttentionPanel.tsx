import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/format';
import { AlertTriangle, CalendarClock, Hourglass, ArrowRight } from 'lucide-react';
import type { Proposal } from '@/hooks/useProposals';

type Bucket = 'expired' | 'expiring' | 'stale';

const DAY = 86400000;

export function AttentionPanel({
  proposals,
  finalStatusIds,
}: {
  proposals: Proposal[];
  finalStatusIds: string[];
}) {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const [tab, setTab] = useState<Bucket>('expiring');

  const buckets = useMemo(() => {
    const now = Date.now();
    const openOnes = proposals.filter((p) => !finalStatusIds.includes(p.status_id || ''));
    const expired: Proposal[] = [];
    const expiring: Proposal[] = [];
    const stale: Proposal[] = [];

    for (const p of openOnes) {
      const validUntil = p.valid_until ? new Date(p.valid_until).getTime() : null;
      if (validUntil !== null && validUntil < now) {
        expired.push(p);
      } else if (validUntil !== null && validUntil - now <= 7 * DAY) {
        expiring.push(p);
      } else if (new Date(p.updated_at).getTime() < now - 7 * DAY) {
        stale.push(p);
      }
    }

    const byDate = (a: Proposal, b: Proposal) =>
      new Date(a.valid_until ?? a.updated_at).getTime() - new Date(b.valid_until ?? b.updated_at).getTime();

    return {
      expired: expired.sort(byDate),
      expiring: expiring.sort(byDate),
      stale: stale.sort(byDate),
    };
  }, [proposals, finalStatusIds]);

  const totalCount = buckets.expired.length + buckets.expiring.length + buckets.stale.length;
  if (totalCount === 0) return null;

  const tabs: { key: Bucket; label: string; icon: typeof AlertTriangle; count: number }[] = [
    { key: 'expiring', label: t('attention.expiring'), icon: CalendarClock, count: buckets.expiring.length },
    { key: 'expired', label: t('attention.expired'), icon: AlertTriangle, count: buckets.expired.length },
    { key: 'stale', label: t('attention.stale'), icon: Hourglass, count: buckets.stale.length },
  ];

  const active = buckets[tab];
  const totalValue = active.reduce((s, p) => s + Number(p.total_amount), 0);

  return (
    <Card className="border-amber-500/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {t('attention.title')}
          <Badge variant="secondary">{totalCount}</Badge>
        </CardTitle>
        <div className="flex flex-wrap gap-2 pt-2">
          {tabs.map((b) => (
            <Button
              key={b.key}
              size="sm"
              variant={tab === b.key ? 'default' : 'outline'}
              onClick={() => setTab(b.key)}
              className="h-8"
            >
              <b.icon className="mr-1.5 h-3.5 w-3.5" />
              {b.label}
              <span className="ml-1.5 opacity-70">{b.count}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('attention.emptyBucket')}</p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2">
              {t('attention.summary', { count: active.length, value: formatCurrency(totalValue) })}
            </p>
            <div className="space-y-1">
              {active.slice(0, 5).map((p) => {
                const days = p.valid_until
                  ? Math.round((new Date(p.valid_until).getTime() - Date.now()) / DAY)
                  : Math.round((Date.now() - new Date(p.updated_at).getTime()) / DAY);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/proposals/${p.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.clients?.name || t('recent.noClient')}
                        {' · '}
                        {tab === 'stale'
                          ? t('attention.stalledFor', { days })
                          : tab === 'expired'
                            ? t('attention.expiredOn', { date: formatDate(p.valid_until!) })
                            : t('attention.expiresIn', { days: Math.max(days, 0) })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">
                        {formatCurrency(Number(p.total_amount), p.currency)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
            {active.length > 5 && (
              <Button
                variant="link"
                size="sm"
                className="px-2 mt-1"
                onClick={() => navigate('/proposals')}
              >
                {t('attention.viewAll', { count: active.length })}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
