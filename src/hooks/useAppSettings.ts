import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAppSettings(category?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['app_settings', category],
    queryFn: async () => {
      let q = supabase.from('app_settings').select('*');
      if (category) q = q.eq('category', category);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async ({ key, value, category: cat }: { key: string; value: any; category: string }) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value, category: cat }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
    },
  });

  const getSetting = (key: string) => {
    const item = query.data?.find((s) => s.key === key);
    return item?.value;
  };

  return { settings: query.data ?? [], isLoading: query.isLoading, getSetting, upsert };
}
