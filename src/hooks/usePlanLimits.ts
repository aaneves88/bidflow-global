import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentPlan } from './useCurrentPlan';

export function usePlanLimits() {
  const { user, isAdmin } = useAuth();
  const { data: currentPlan } = useCurrentPlan();

  const counts = useQuery({
    queryKey: ['plan-limits-counts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ count: proposalsCount }, { count: clientsCount }] = await Promise.all([
        supabase.from('proposals').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      ]);
      return {
        proposalsUsed: proposalsCount ?? 0,
        clientsUsed: clientsCount ?? 0,
      };
    },
  });

  const proposalsUsed = counts.data?.proposalsUsed ?? 0;
  const clientsUsed = counts.data?.clientsUsed ?? 0;
  const maxProposals = currentPlan?.plan?.max_proposals ?? null;
  const maxClients = currentPlan?.plan?.max_clients ?? null;
  const isExpired = currentPlan?.isExpired ?? false;
  const hasPlan = !!currentPlan;

  // Admin bypass
  if (isAdmin) {
    return {
      proposalsUsed, clientsUsed, maxProposals: null, maxClients: null,
      canCreateProposal: true, canCreateClient: true,
      isExpired: false, hasPlan: true,
    };
  }

  // No plan or expired -> blocked
  const blocked = !hasPlan || isExpired;

  return {
    proposalsUsed,
    clientsUsed,
    maxProposals,
    maxClients,
    canCreateProposal: !blocked && (maxProposals === null || proposalsUsed < maxProposals),
    canCreateClient: !blocked && (maxClients === null || clientsUsed < maxClients),
    isExpired,
    hasPlan,
  };
}
