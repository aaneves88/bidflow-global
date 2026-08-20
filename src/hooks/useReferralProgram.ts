import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const REFERRAL_STORAGE_KEY = 'orca_pending_referral_code';

export interface Referral {
  id: string;
  referral_code: string;
  status: 'pending' | 'converted' | 'paid';
  discount_percent: number;
  created_at: string;
  converted_at: string | null;
  paid_at: string | null;
  referred_full_name: string | null;
  referred_email: string | null;
  referred_created_at: string | null;
}

export function useReferralProgram() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile_referral', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code, full_name')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const referralsQuery = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.rpc('get_my_referrals');
      if (error) throw error;
      return (data ?? []) as Referral[];
    },
    enabled: !!user,
  });


  const copyLink = async () => {
    const code = profileQuery.data?.referral_code;
    if (!code) return;
    const url = `https://orca-mento.app/register?ref=${code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback ignored
    }
  };

  return {
    referralCode: profileQuery.data?.referral_code ?? null,
    referrals: referralsQuery.data ?? [],
    isLoading: profileQuery.isLoading || referralsQuery.isLoading,
    copyLink,
  };
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Concede 30 dias de acesso ao usuário que indicou e registra a recompensa.
 * - Plano ativo com expires_at: soma 30 dias (não recria a linha).
 * - Plano ativo vitalício (expires_at null): nada a estender.
 * - Sem plano ativo: concede o Premium por 30 dias.
 */
export function useGrantReferralReward() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referralId, userId }: { referralId: string; userId: string }) => {
      const { data: activePlans, error: apErr } = await supabase
        .from('user_plans')
        .select('id, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('starts_at', { ascending: false })
        .limit(1);
      if (apErr) throw apErr;

      const active = activePlans?.[0];

      if (active) {
        if (active.expires_at) {
          const extended = new Date(new Date(active.expires_at).getTime() + THIRTY_DAYS_MS);
          const { error } = await supabase
            .from('user_plans')
            .update({ expires_at: extended.toISOString() })
            .eq('id', active.id);
          if (error) throw error;
        }
        // expires_at null => plano ilimitado, nada a estender
      } else {
        const { data: plan, error: planErr } = await supabase
          .from('plans')
          .select('id')
          .gt('price', 0)
          .eq('is_active', true)
          .order('price', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (planErr) throw planErr;
        if (!plan) throw new Error('No paid plan available');

        const { error } = await supabase.from('user_plans').insert({
          user_id: userId,
          plan_id: plan.id,
          granted_by: user?.id ?? null,
          status: 'active',
          expires_at: new Date(Date.now() + THIRTY_DAYS_MS).toISOString(),
        });
        if (error) throw error;
      }

      const { error: refErr } = await supabase
        .from('referrals')
        .update({ reward_granted_at: new Date().toISOString() })
        .eq('id', referralId);
      if (refErr) throw refErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_referrals'] });
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    },
  });
}

export function getPendingReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFERRAL_STORAGE_KEY);
}

export function storePendingReferralCode(code: string | null) {
  if (typeof window === 'undefined') return;
  if (code) {
    localStorage.setItem(REFERRAL_STORAGE_KEY, code);
  } else {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  }
}

export function clearPendingReferralCode() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
}
