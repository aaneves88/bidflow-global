import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProposalViewsSummary {
  count: number;
  firstView: string | null;
  lastView: string | null;
}

export function useProposalViews(proposalId: string | undefined) {
  return useQuery<ProposalViewsSummary>({
    queryKey: ['proposal-views', proposalId],
    enabled: !!proposalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_views')
        .select('viewed_at')
        .eq('proposal_id', proposalId!)
        .order('viewed_at', { ascending: true });
      if (error) throw error;
      const list = data ?? [];
      return {
        count: list.length,
        firstView: list[0]?.viewed_at ?? null,
        lastView: list[list.length - 1]?.viewed_at ?? null,
      };
    },
  });
}

export function useRecordProposalView() {
  return useMutation({
    mutationFn: async (proposalId: string) => {
      // De-dupe per session
      const key = `cf_view_${proposalId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');

      await supabase.from('proposal_views').insert({
        proposal_id: proposalId,
        user_agent: navigator.userAgent.slice(0, 200),
      });
    },
  });
}
