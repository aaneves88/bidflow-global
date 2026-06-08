import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import i18n from '@/i18n';

const tr = (key: string) => i18n.t(key, { ns: 'proposals' });
const trCommon = (key: string) => i18n.t(key, { ns: 'common' });

export type ProposalItem = {
  id?: string;
  proposal_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  position: number;
};

export type Proposal = {
  id: string;
  user_id: string;
  client_id: string | null;
  public_code: string;
  title: string;
  description: string | null;
  notes: string | null;
  terms: string | null;
  currency: string;
  total_amount: number;
  status_id: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string; email: string | null; company: string | null } | null;
  proposal_statuses?: { name: string; color: string } | null;
};

export type ProposalFormData = {
  client_id?: string | null;
  title: string;
  description?: string;
  notes?: string;
  terms?: string;
  currency: string;
  valid_until?: string | null;
  status_id?: string | null;
  items: ProposalItem[];
};

export function useProposals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, clients(name, email, company), proposal_statuses(name, color)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Proposal[];
    },
    enabled: !!user,
  });
}

export function useProposal(id: string | undefined) {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, clients(name, email, company, phone), proposal_statuses(name, color)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Proposal & { clients: { name: string; email: string | null; company: string | null; phone: string | null } | null };
    },
    enabled: !!id,
  });
}

export function useProposalItems(proposalId: string | undefined) {
  return useQuery({
    queryKey: ['proposal-items', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_items')
        .select('*')
        .eq('proposal_id', proposalId!)
        .order('position');
      if (error) throw error;
      return data as ProposalItem[];
    },
    enabled: !!proposalId,
  });
}

export function useProposalStatuses() {
  return useQuery({
    queryKey: ['proposal-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_statuses')
        .select('*')
        .order('position');
      if (error) throw error;
      return data;
    },
  });
}

export function useProposalStatusHistory(proposalId: string | undefined) {
  return useQuery({
    queryKey: ['proposal-history', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_status_history')
        .select('*, proposal_statuses(name, color)')
        .eq('proposal_id', proposalId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: ProposalFormData) => {
      const totalAmount = data.items.reduce((s, i) => s + i.total, 0);

      const public_code = Math.random().toString(36).substring(2, 12);
      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert({
          user_id: user!.id,
          client_id: data.client_id || null,
          title: data.title,
          description: data.description || null,
          currency: data.currency,
          total_amount: totalAmount,
          status_id: data.status_id || null,
          valid_until: data.valid_until || null,
          public_code,
        })
        .select()
        .single();
      if (error) throw error;

      if (data.items.length > 0) {
        const items = data.items.map((item, idx) => ({
          proposal_id: proposal.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          position: idx,
        }));
        const { error: itemsErr } = await supabase.from('proposal_items').insert(items);
        if (itemsErr) throw itemsErr;
      }

      // Insert initial status history
      if (data.status_id) {
        await supabase.from('proposal_status_history').insert({
          proposal_id: proposal.id,
          status_id: data.status_id,
          changed_by: user!.id,
          notes: 'Proposal created',
        });
      }

      return proposal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      toast({ title: tr('messages.created') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorSaving'), description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProposal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ProposalFormData & { id: string }) => {
      const totalAmount = data.items.reduce((s, i) => s + i.total, 0);

      const { error } = await supabase
        .from('proposals')
        .update({
          client_id: data.client_id || null,
          title: data.title,
          description: data.description || null,
          currency: data.currency,
          total_amount: totalAmount,
          status_id: data.status_id || null,
          valid_until: data.valid_until || null,
        })
        .eq('id', id);
      if (error) throw error;

      // Replace items
      await supabase.from('proposal_items').delete().eq('proposal_id', id);
      if (data.items.length > 0) {
        const items = data.items.map((item, idx) => ({
          proposal_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          position: idx,
        }));
        const { error: itemsErr } = await supabase.from('proposal_items').insert(items);
        if (itemsErr) throw itemsErr;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      qc.invalidateQueries({ queryKey: ['proposal-items', vars.id] });
      toast({ title: tr('messages.updated') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorSaving'), description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProposalStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id, status_id, closed_amount, closed_notes,
    }: { id: string; status_id: string; closed_amount?: number | null; closed_notes?: string | null }) => {
      const update: any = { status_id };
      if (closed_amount !== undefined) update.closed_amount = closed_amount;
      if (closed_notes !== undefined) update.closed_notes = closed_notes;
      const { error } = await supabase
        .from('proposals')
        .update(update)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      qc.invalidateQueries({ queryKey: ['proposals', vars.id] });
      qc.invalidateQueries({ queryKey: ['proposal-history', vars.id] });
      toast({ title: tr('messages.statusUpdated') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorSaving'), description: e.message, variant: 'destructive' });
    },
  });
}


export function useDeleteProposal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      toast({ title: tr('messages.deleted') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorDeleting'), description: e.message, variant: 'destructive' });
    },
  });
}

export function useDuplicateProposal() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      // Fetch source
      const { data: src, error: srcErr } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', sourceId)
        .single();
      if (srcErr) throw srcErr;

      const { data: items, error: itemsErr } = await supabase
        .from('proposal_items')
        .select('*')
        .eq('proposal_id', sourceId)
        .order('position');
      if (itemsErr) throw itemsErr;

      // Find initial (non-final) status
      const { data: statuses } = await supabase
        .from('proposal_statuses')
        .select('id, is_final, position')
        .order('position');
      const initial = statuses?.find((s: any) => !s.is_final) ?? statuses?.[0];

      const { data: created, error: createErr } = await supabase
        .from('proposals')
        .insert({
          user_id: user!.id,
          client_id: src.client_id,
          title: `${src.title} (cópia)`,
          description: src.description,
          currency: src.currency,
          total_amount: src.total_amount,
          status_id: initial?.id ?? null,
          valid_until: src.valid_until,
        })
        .select()
        .single();
      if (createErr) throw createErr;

      if (items && items.length > 0) {
        const newItems = items.map((it: any, idx: number) => ({
          proposal_id: created.id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total: it.total,
          position: idx,
        }));
        const { error: insErr } = await supabase.from('proposal_items').insert(newItems);
        if (insErr) throw insErr;
      }

      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      qc.invalidateQueries({ queryKey: ['plan-limits-counts'] });
      toast({ title: tr('messages.duplicated') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorSaving'), description: e.message, variant: 'destructive' });
    },
  });
}

// For public page — uses anon access
export function usePublicProposal(publicCode: string | undefined) {
  return useQuery({
    queryKey: ['public-proposal', publicCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, clients(name, email, company, phone), proposal_statuses(name, color), proposal_items(*)')
        .eq('public_code', publicCode!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!publicCode,
  });
}
