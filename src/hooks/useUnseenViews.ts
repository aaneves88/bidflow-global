import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LS_KEY = 'cf_views_seen_at';

export function getLastSeenViewsAt(): string {
  return localStorage.getItem(LS_KEY) || new Date(0).toISOString();
}

export function markViewsAsSeen() {
  localStorage.setItem(LS_KEY, new Date().toISOString());
}

export interface UnseenView {
  proposal_id: string;
  proposal_title: string;
  viewed_at: string;
  client_name: string | null;
}

export function useUnseenViews() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['unseen-views', user?.id],
    enabled: !!user,
    refetchInterval: 60000,
    queryFn: async () => {
      const since = getLastSeenViewsAt();
      const { data: proposals } = await supabase
        .from('proposals')
        .select('id, title, clients(name)')
        .eq('user_id', user!.id);
      const ids = (proposals ?? []).map((p) => p.id);
      if (ids.length === 0) return [] as UnseenView[];

      const { data: views, error } = await supabase
        .from('proposal_views')
        .select('proposal_id, viewed_at')
        .in('proposal_id', ids)
        .gt('viewed_at', since)
        .order('viewed_at', { ascending: false });

      if (error) throw error;

      const map = new Map<string, { title: string; client_name: string | null }>();
      (proposals ?? []).forEach((p: any) => {
        map.set(p.id, { title: p.title, client_name: p.clients?.name ?? null });
      });

      const out: UnseenView[] = (views ?? []).map((v: any) => ({
        proposal_id: v.proposal_id,
        viewed_at: v.viewed_at,
        proposal_title: map.get(v.proposal_id)?.title ?? '—',
        client_name: map.get(v.proposal_id)?.client_name ?? null,
      }));
      return out;
    },
  });
}
