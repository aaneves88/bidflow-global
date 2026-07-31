import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  status: string;
  starts_at: string;
  expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
  };
  isPaid: boolean;
}

/**
 * Assinatura vigente do usuário, incluindo estados não-ativos (past_due,
 * cancelled) que o useCurrentPlan filtra fora.
 */
export function useSubscription() {
  const { user } = useAuth();

  return useQuery<Subscription | null>({
    queryKey: ['subscription', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_plans')
        .select('status, starts_at, expires_at, stripe_customer_id, stripe_subscription_id, plans!inner(id, name, price, currency, interval)')
        .eq('user_id', user!.id)
        .in('status', ['active', 'past_due', 'cancelled'])
        .order('starts_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const plan = data.plans as any;
      return {
        status: data.status,
        starts_at: data.starts_at,
        expires_at: data.expires_at,
        stripe_customer_id: data.stripe_customer_id,
        stripe_subscription_id: data.stripe_subscription_id,
        plan,
        isPaid: Number(plan?.price) > 0,
      };
    },
  });
}
