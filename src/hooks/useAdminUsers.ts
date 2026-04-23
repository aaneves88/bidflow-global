import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  roles: string[];
  current_plan: string | null;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase.from('user_roles').select('*');
      if (rErr) throw rErr;

      const { data: userPlans, error: upErr } = await supabase
        .from('user_plans')
        .select('*, plans(name)')
        .eq('status', 'active');
      if (upErr) throw upErr;

      return (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        created_at: p.created_at,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
        current_plan: (userPlans ?? []).find((up) => up.user_id === p.id)?.plans?.name ?? null,
      })) as AdminUser[];
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, isCurrentlyAdmin }: { userId: string; isCurrentlyAdmin: boolean }) => {
      if (isCurrentlyAdmin) {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  const grantPlan = useMutation({
    mutationFn: async ({ userId, planId, grantedBy, expiresAt }: { userId: string; planId: string; grantedBy: string; expiresAt?: string }) => {
      const { error } = await supabase.from('user_plans').insert({
        user_id: userId,
        plan_id: planId,
        granted_by: grantedBy,
        status: 'active',
        expires_at: expiresAt || null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  return { users: query.data ?? [], isLoading: query.isLoading, toggleAdmin, grantPlan };
}
