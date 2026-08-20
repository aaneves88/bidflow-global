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
