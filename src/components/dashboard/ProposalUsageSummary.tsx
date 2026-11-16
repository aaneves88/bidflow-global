import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { summarizeUsage, averageByCurrency, type UsageEvent } from '@/lib/proposalUsage';
import { formatCurrency } from '@/lib/format';
import type { Proposal } from '@/hooks/useProposals';

export function ProposalUsageSummary({ proposals, start, end }: { proposals: Proposal[]; start: Date; end: Date }) {
  const { t } = useTranslation('usage');
  const { user } = useAuth();
  const { data, error, isLoading } = useQuery({
    queryKey: ['dashboard-proposal-usage', user?.id, start.toISOString(), end.toISOString()],
    enabled: !!user,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase.from('proposal_usage_events').select('proposal_id,event_type,created_at').gte('created_at', start.toISOString()).lte('created_at', new Date().toISOString());
      if (error) throw error;
      return data as UsageEvent[];
    },
  });
  const summary = summarizeUsage(data ?? []);
  return <section className="space-y-3 border-y py-5">
    <h2 className="text-lg font-semibold">{t('summaryTitle')}</h2>
    {error ? <p className="text-destructive">{t('error')}</p> : isLoading ? <p>{t('loading')}</p> : <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{Object.entries(summary).map(([key, value]) => <div key={key}><dt className="text-sm text-muted-foreground">{t(`summary.${key}`)}</dt><dd className="text-xl font-semibold tabular-nums">{value}</dd></div>)}<div><dt className="text-sm text-muted-foreground">{t('columns.average_values')}</dt><dd className="font-semibold">{Object.entries(averageByCurrency(proposals)).map(([currency, value]) => <p key={currency}>{formatCurrency(value, currency)}</p>)}</dd></div></dl>}
    <p className="text-sm text-muted-foreground">{t('trackingNote')}</p>
  </section>;
}