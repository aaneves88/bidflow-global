import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CurrentPlan {
  user_plan_id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
  plan: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    interval: string;
    is_starter: boolean;
    trial_days: number;
    max_proposals: number | null;
    max_clients: number | null;
    features: any;
  };
  isExpired: boolean;
  daysLeft: number | null;
}

export function useCurrentPlan() {
  const { user } = useAuth();

  return useQuery<CurrentPlan | null>({
    queryKey: ['current-plan', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_plans')
        .select('id, plan_id, status, starts_at, expires_at, plans!inner(*)')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('starts_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const expires = data.expires_at ? new Date(data.expires_at) : null;
      const now = new Date();
      const isExpired = expires ? expires < now : false;
      const daysLeft = expires
        ? Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

      return {
        user_plan_id: data.id,
        plan_id: data.plan_id,
        status: data.status,
        starts_at: data.starts_at,
        expires_at: data.expires_at,
        plan: data.plans as any,
        isExpired,
        daysLeft,
      };
    },
  });
}
