import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

export function useProposalStatuses() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['proposal_statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_statuses')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const upsertStatus = useMutation({
    mutationFn: async (status: TablesInsert<'proposal_statuses'>) => {
      const { error } = await supabase.from('proposal_statuses').upsert(status);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposal_statuses'] }),
  });

  const deleteStatus = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('proposal_statuses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposal_statuses'] }),
  });

  return { statuses: query.data ?? [], isLoading: query.isLoading, upsertStatus, deleteStatus };
}
