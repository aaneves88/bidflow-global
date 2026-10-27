import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UnopenedProposal = { id: string; title: string; created_at: string };

/** Propostas com mais de 24h (e menos de 30 dias), não finalizadas, que o cliente ainda não abriu. */
export function useUnopenedProposals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['unopened-proposals', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<UnopenedProposal[]> => {
      const now = Date.now();
      const { data } = await supabase
        .from('proposals')
        .select('id, title, created_at, proposal_statuses(is_final), proposal_views(id)')
        .eq('user_id', user!.id)
        .lte('created_at', new Date(now - 24 * 3600_000).toISOString())
        .gte('created_at', new Date(now - 30 * 86_400_000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);
      return ((data as any[]) ?? [])
        .filter((p) => !p.proposal_statuses?.is_final && (p.proposal_views?.length ?? 0) === 0)
        .slice(0, 5)
        .map((p) => ({ id: p.id, title: p.title, created_at: p.created_at }));
    },
  });
}
