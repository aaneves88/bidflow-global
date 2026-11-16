import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';
import type { Proposal } from '@/hooks/useProposals';

export function ProposalLinkViews({ proposals, start, end }: { proposals: Proposal[]; start: Date; end: Date }) {
  const { t } = useTranslation('usage');
  const { user } = useAuth();
  const { data, error, isLoading } = useQuery({
    queryKey: ['dashboard-link-views', user?.id, start.toISOString(), end.toISOString()],
    enabled: !!user,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase.from('proposal_views').select('proposal_id,viewed_at').gte('viewed_at',start.toISOString()).lte('viewed_at',end.toISOString()).order('viewed_at',{ ascending: false }).limit(100);
      if (error) throw error;
      const seen = new Set<string>();
      return (data ?? []).filter(view => { if(seen.has(view.proposal_id)) return false; seen.add(view.proposal_id); return true; }).slice(0,5);
    },
  });
  return <section className="space-y-3"><h2 className="text-lg font-semibold">{t('viewedTitle')}</h2>{error ? <p className="text-destructive">{t('error')}</p> : isLoading ? <p>{t('loading')}</p> : !data?.length ? <p className="text-sm text-muted-foreground">{t('noViews')}</p> : data.map(view => <Link key={view.proposal_id} to={`/proposals/${view.proposal_id}`} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm"><span className="font-medium">{proposals.find(p => p.id === view.proposal_id)?.title ?? '—'}</span><span className="flex flex-wrap gap-2 items-center"><Badge variant="secondary">{t('viewed')}</Badge><time className="text-muted-foreground">{formatDateTime(view.viewed_at)}</time></span></Link>)}</section>;
}