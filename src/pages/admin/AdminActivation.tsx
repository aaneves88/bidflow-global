import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/format';
import { Info } from 'lucide-react';

type Funnel = {
  accounts: number;
  with_client: number;
  with_proposal: number;
  with_view: number;
  with_approved: number;
  paid: number;
};

type Stats = {
  funnel: Funnel;
  median_hours_to_first_proposal: number | null;
  stalled: { id: string; email: string | null; full_name: string | null; created_at: string }[];
  active_7d: number;
  active_30d: number;
  status_distribution: { name: string; color: string; is_won: boolean; total: number }[];
  proposals_total: number;
  proposals_won: number;
  active_subscriptions: number;
  mrr: number;
  signups_by_day: { day: string; total: number }[];
};

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export default function AdminActivation() {
  const { t, i18n } = useTranslation('admin');

  const { data, isLoading } = useQuery({
    queryKey: ['admin_activation_stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_activation_stats');
      if (error) throw error;
      return data as unknown as Stats;
    },
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('activation.loading')}</p>;
  }

  const f = data.funnel;
  const steps = [
    { key: 'accounts', value: f.accounts },
    { key: 'withClient', value: f.with_client },
    { key: 'withProposal', value: f.with_proposal },
    { key: 'withView', value: f.with_view },
    { key: 'withApproved', value: f.with_approved },
    { key: 'paid', value: f.paid },
  ];

  const medianH = data.median_hours_to_first_proposal;
  const medianLabel =
    medianH == null
      ? '—'
      : medianH < 48
        ? t('activation.hours', { count: Math.round(medianH) })
        : t('activation.days', { count: Math.round(medianH / 24) });

  const maxSignup = Math.max(1, ...data.signups_by_day.map((d) => d.total));
  const dateFmt = new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{t('activation.internalNote')}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('activation.funnelTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((s, idx) => {
            const prev = idx === 0 ? null : steps[idx - 1].value;
            const width = pct(s.value, f.accounts || 1);
            return (
              <div key={s.key} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{t(`activation.steps.${s.key}`)}</span>
                  <span className="tabular-nums">
                    <span className="font-semibold">{s.value}</span>
                    {prev !== null && (
                      <span className="text-muted-foreground ml-2">
                        {t('activation.fromPrevious', { pct: pct(s.value, prev) })}
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('activation.medianFirstProposal')}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{medianLabel}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('activation.active7')}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.active_7d}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('activation.active30')}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.active_30d}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('activation.approvalRate')}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pct(data.proposals_won, data.proposals_total)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('activation.approvalRateDetail', { won: data.proposals_won, total: data.proposals_total })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('activation.activeSubscriptions')}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.active_subscriptions}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('activation.mrr')}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(Number(data.mrr) || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('activation.freeToPaid')}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{pct(f.paid, f.accounts)}%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('activation.statusDistribution')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.status_distribution.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('activation.empty')}</p>
          )}
          {data.status_distribution.map((s) => (
            <div key={s.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
                <span className="tabular-nums">
                  {s.total} <span className="text-muted-foreground">({pct(s.total, data.proposals_total)}%)</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full" style={{ width: `${pct(s.total, data.proposals_total)}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('activation.signups')}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {data.signups_by_day.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1" title={`${d.day}: ${d.total}`}>
                <div
                  className="w-full rounded-t bg-primary/80 min-h-[2px]"
                  style={{ height: `${(d.total / maxSignup) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{dateFmt.format(new Date(`${data.signups_by_day[0]?.day}T12:00:00`))}</span>
            <span>{dateFmt.format(new Date(`${data.signups_by_day[data.signups_by_day.length - 1]?.day}T12:00:00`))}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('activation.stalledTitle', { count: data.stalled.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{t('activation.stalledSubtitle')}</p>
          {data.stalled.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('activation.stalledEmpty')}</p>
          ) : (
            <div className="divide-y">
              {data.stalled.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.full_name || t('overview.noName')}</p>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString(i18n.language)}
                    </span>
                    {u.email && (
                      <a className="text-sm text-primary underline" href={`mailto:${u.email}`}>
                        {t('activation.contact')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
