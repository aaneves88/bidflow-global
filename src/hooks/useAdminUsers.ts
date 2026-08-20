import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ActivityStatus = 'never' | 'no_proposal' | 'active' | 'inactive';

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  roles: string[];
  current_plan: string | null;
  is_premium: boolean;
  is_courtesy: boolean;
  plan_expires_at: string | null;
  last_sign_in_at: string | null;
  proposals_count: number;
  last_proposal_at: string | null;
  clients_count: number;
  activity_status: ActivityStatus;
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
        .eq('status', 'active')
        .order('starts_at', { ascending: false });
      if (upErr) throw upErr;

      const { data: activity, error: aErr } = await supabase.rpc('get_admin_user_activity');
      if (aErr) throw aErr;

      const now = Date.now();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

      return (profiles ?? []).map((p) => {
        const active = (userPlans ?? []).find(
          (up) =>
            up.user_id === p.id &&
            (!up.expires_at || new Date(up.expires_at).getTime() > now),
        );
        const planName = active?.plans?.name ?? null;
        const act = (activity ?? []).find((a) => a.id === p.id);
        const lastSignIn = act?.last_sign_in_at ?? null;
        const proposalsCount = act?.proposals_count ?? 0;

        let activityStatus: ActivityStatus;
        if (!lastSignIn) activityStatus = 'never';
        else if (proposalsCount === 0) activityStatus = 'no_proposal';
        else if (now - new Date(lastSignIn).getTime() <= THIRTY_DAYS) activityStatus = 'active';
        else activityStatus = 'inactive';

        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          created_at: p.created_at,
          roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
          current_plan: planName,
          is_premium: !!planName && /premium/i.test(planName),
          is_courtesy: !!active?.granted_by,
          plan_expires_at: active?.expires_at ?? null,
          last_sign_in_at: lastSignIn,
          proposals_count: proposalsCount,
          last_proposal_at: act?.last_proposal_at ?? null,
          clients_count: act?.clients_count ?? 0,
          activity_status: activityStatus,
        };
      }) as AdminUser[];
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
    mutationFn: async ({
      userId,
      planId,
      grantedBy,
      expiresAt,
    }: {
      userId: string;
      planId: string;
      grantedBy: string;
      expiresAt?: string | null;
    }) => {
      // Planos gratuitos ativos viram "expired" (nunca deixar duas linhas ativas)
      const { data: freePlans } = await supabase.from('plans').select('id').eq('price', 0);
      const freeIds = (freePlans ?? []).map((p) => p.id);
      if (freeIds.length) {
        await supabase
          .from('user_plans')
          .update({ status: 'expired', expires_at: new Date().toISOString() })
          .eq('user_id', userId)
          .in('plan_id', freeIds)
          .in('status', ['active', 'past_due']);
      }

      // Cancel any existing active plan first so the courtesy plan takes over
      await supabase
        .from('user_plans')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');


      const { error } = await supabase.from('user_plans').insert({
        user_id: userId,
        plan_id: planId,
        granted_by: grantedBy,
        status: 'active',
        expires_at: expiresAt ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  return { users: query.data ?? [], isLoading: query.isLoading, toggleAdmin, grantPlan };
}
