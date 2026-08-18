import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import i18n from '@/i18n';

const tr = (key: string) => i18n.t(key, { ns: 'snippets' });
const trCommon = (key: string) => i18n.t(key, { ns: 'common' });

export const SNIPPET_KINDS = ['description', 'notes', 'terms'] as const;
export type SnippetKind = (typeof SNIPPET_KINDS)[number];

export type Snippet = {
  id: string;
  user_id: string;
  kind: SnippetKind;
  title: string;
  body: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type SnippetFormData = {
  kind: SnippetKind;
  title: string;
  body: string;
};

// The generated Supabase types may not know about this table yet.
const table = () => (supabase as any).from('text_snippets');

export function useSnippets(kind?: SnippetKind) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['text_snippets', kind ?? 'all', user?.id],
    queryFn: async () => {
      let query = table().select('*').eq('user_id', user!.id).order('position').order('title');
      if (kind) query = query.eq('kind', kind);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Snippet[];
    },
    enabled: !!user,
  });
}

export function useCreateSnippet() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: SnippetFormData) => {
      const { data: result, error } = await table()
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return result as Snippet;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['text_snippets'] });
      toast({ title: tr('messages.created') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorSaving'), description: e.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSnippet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: SnippetFormData & { id: string }) => {
      const { error } = await table().update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['text_snippets'] });
      toast({ title: tr('messages.updated') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorSaving'), description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSnippet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await table().delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['text_snippets'] });
      toast({ title: tr('messages.deleted') });
    },
    onError: (e: Error) => {
      toast({ title: trCommon('messages.errorDeleting'), description: e.message, variant: 'destructive' });
    },
  });
}
