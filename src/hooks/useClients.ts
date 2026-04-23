import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type Client = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  proposal_count?: number;
};

export type ClientFormData = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
};

export function useClients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user,
  });
}

export function useClientsWithProposalCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', 'with-counts'],
    queryFn: async () => {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;

      const { data: proposals, error: pErr } = await supabase
        .from('proposals')
        .select('client_id');
      if (pErr) throw pErr;

      const countMap: Record<string, number> = {};
      proposals?.forEach((p) => {
        if (p.client_id) countMap[p.client_id] = (countMap[p.client_id] || 0) + 1;
      });

      return (clients as Client[]).map((c) => ({
        ...c,
        proposal_count: countMap[c.id] || 0,
      }));
    },
    enabled: !!user,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: ClientFormData) => {
      const { data: result, error } = await supabase
        .from('clients')
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Client created' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ClientFormData & { id: string }) => {
      const { error } = await supabase.from('clients').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Client updated' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Client deleted' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });
}
