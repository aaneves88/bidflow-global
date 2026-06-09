import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentPlan } from './useCurrentPlan';

const FREE_PROPOSAL_QUOTA = 3;

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
  const hasActivePlan = hasPlan && !isExpired;

  // Admin bypass
  if (isAdmin) {
    return {
      proposalsUsed, clientsUsed,
      maxProposals: null, maxClients: null,
      canCreateProposal: true, canCreateClient: true,
      isExpired: false, hasPlan: true, hasActivePlan: true,
      isOnFreeTier: false,
      freeProposalsRemaining: 0,
      freeProposalUsed: false,
      reason: null as null | 'free_exhausted' | 'plan_limit',
    };
  }

  // Free tier: no active plan
  if (!hasActivePlan) {
    const freeProposalsRemaining = Math.max(0, FREE_PROPOSAL_QUOTA - proposalsUsed);
    return {
      proposalsUsed, clientsUsed,
      maxProposals: FREE_PROPOSAL_QUOTA, maxClients,
      canCreateProposal: freeProposalsRemaining > 0,
      canCreateClient: maxClients === null || clientsUsed < (maxClients ?? Infinity),
      isExpired,
      hasPlan,
      hasActivePlan: false,
      isOnFreeTier: true,
      freeProposalsRemaining,
      freeProposalUsed: proposalsUsed >= FREE_PROPOSAL_QUOTA,
      reason: freeProposalsRemaining > 0 ? null : 'free_exhausted' as const,
    };
  }

  // Active paid plan
  const withinProposals = maxProposals === null || proposalsUsed < maxProposals;
  const withinClients = maxClients === null || clientsUsed < maxClients;
  return {
    proposalsUsed, clientsUsed, maxProposals, maxClients,
    canCreateProposal: withinProposals,
    canCreateClient: withinClients,
    isExpired: false,
    hasPlan: true,
    hasActivePlan: true,
    isOnFreeTier: false,
    freeProposalsRemaining: 0,
    freeProposalUsed: true,
    reason: withinProposals ? null : 'plan_limit' as const,
  };
}

export function useFeatureFlag(flag: 'allow_pdf_export' | 'allow_templates' | 'allow_custom_branding'): boolean {
  const { isAdmin } = useAuth();
  const { data: currentPlan } = useCurrentPlan();
  if (isAdmin) return true;
  if (!currentPlan || currentPlan.isExpired) return false;
  return Boolean((currentPlan.plan as any)?.[flag]);
}

/**
 * Free users can't customize branding on the proposal — their proposals
 * always render with Orca branding and a watermark.
 */
export function useCanCustomBrand(): boolean {
  const { isAdmin } = useAuth();
  const { data: currentPlan } = useCurrentPlan();
  if (isAdmin) return true;
  if (!currentPlan) return false;
  if (currentPlan.isExpired) return false;
  return true;
}
