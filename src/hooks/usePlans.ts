import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export function usePlans(includeInactive = false) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['plans', includeInactive],
    queryFn: async () => {
      let q = supabase.from('plans').select('*').order('created_at', { ascending: false });
      if (!includeInactive) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const upsertPlan = useMutation({
    mutationFn: async (plan: TablesInsert<'plans'>) => {
      const { error } = await supabase.from('plans').upsert(plan);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  return { plans: query.data ?? [], isLoading: query.isLoading, upsertPlan };
}
