import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import i18n from '@/i18n';

const tr = (key: string) => i18n.t(key, { ns: 'products' });
const trCommon = (key: string) => i18n.t(key, { ns: 'common' });

export type Product = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  default_price: number;
  unit: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductFormData = {
  name: string;
  description?: string;
  default_price: number;
  unit?: string;
  is_active?: boolean;
};

export function useProducts(activeOnly = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['products', activeOnly],
    queryFn: async () => {
      let query = supabase.from('products').select('*').order('name');
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Product[];
    },
    enabled: !!user,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { data: result, error } = await supabase
        .from('products')
        .insert({ ...data, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast({ title: tr('messages.created') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorSaving'), description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ProductFormData & { id: string }) => {
      const { error } = await supabase.from('products').update(data as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast({ title: tr('messages.updated') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorSaving'), description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast({ title: tr('messages.deleted') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorDeleting'), description: e.message, variant: 'destructive' });
    },
  });
}
