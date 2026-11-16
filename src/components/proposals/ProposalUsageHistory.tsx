import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/lib/format';
import type { UsageEvent } from '@/lib/proposalUsage';

export function ProposalUsageHistory({ proposalId }: { proposalId: string }) {
  const { t } = useTranslation('usage');
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['proposal-usage', user?.id, proposalId],
    enabled: !!user,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase.from('proposal_usage_events').select('proposal_id,event_type,created_at').eq('proposal_id', proposalId).order('created_at', { ascending: false }).limit(30);
      if (error) throw error;
      return data as UsageEvent[];
    },
  });
  return <section className="space-y-3 border-t pt-5">
    <h2 className="text-lg font-semibold">{t('history')}</h2>
    <p className="text-sm text-muted-foreground">{t('trackingNote')}</p>
    {isLoading ? <p>{t('loading')}</p> : error ? <p className="text-destructive">{t('error')}</p> : !data?.length ? <p className="text-sm text-muted-foreground">{t('emptyHistory')}</p> :
      <ul className="space-y-2">{data.map((event, index) => <li key={`${event.created_at}-${index}`} className="flex flex-wrap justify-between gap-2 text-sm"><span>{t(`events.${event.event_type}`)}</span><time className="text-muted-foreground">{formatDateTime(event.created_at)}</time></li>)}</ul>}
  </section>;
}