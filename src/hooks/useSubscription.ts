import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isUnlimited, reachedLimit } from '@/lib/planLimits';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  max_proposals: number | null;
  max_clients: number | null;
  features: any;
  allow_pdf_export?: boolean;
  allow_templates?: boolean;
  allow_custom_branding?: boolean;
}

export interface SubscriptionState {
  plan: SubscriptionPlan | null;
  planName: string;
  isFree: boolean;
  isPaid: boolean;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  isExpired: boolean;
  hasActivePlan: boolean;
  // uso
  proposalsUsed: number;
  clientsUsed: number;
  maxProposals: number | null;
  maxClients: number | null;
  proposalsUnlimited: boolean;
  clientsUnlimited: boolean;
  canCreateProposal: boolean;
  canCreateClient: boolean;
  proposalLimitReached: boolean;
  clientLimitReached: boolean;
}

const FALLBACK_FREE = {
  id: 'free',
  name: 'Gratuito',
  description: null,
  price: 0,
  currency: 'BRL',
  interval: 'month',
  max_proposals: 1,
  max_clients: 5,
  features: [],
} as SubscriptionPlan;

/**
 * FONTE ÚNICA DA VERDADE do plano do usuário.
 * Resolve o plano UMA vez (assinatura ativa em user_plans; na ausência dela,
 * o plano gratuito) e devolve plano + limites + uso já calculados.
 * Nenhuma outra tela deve resolver plano por conta própria.
 */
export function useSubscription() {
  const { user, isAdmin } = useAuth();

  const query = useQuery<SubscriptionState>({
    queryKey: ['subscription', user?.id, isAdmin],
    enabled: !!user,
    queryFn: async () => {
      const [subRes, freeRes, proposalsRes, clientsRes] = await Promise.all([
        supabase
          .from('user_plans')
          .select('status, starts_at, expires_at, stripe_customer_id, stripe_subscription_id, plans!inner(*)')
          .eq('user_id', user!.id)
          .in('status', ['active', 'past_due', 'cancelled'])
          .order('starts_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('plans').select('*').eq('price', 0).eq('is_active', true).limit(1).maybeSingle(),
        supabase.from('proposals').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      ]);

      const freePlan = (freeRes.data as any as SubscriptionPlan) ?? FALLBACK_FREE;
      const row = subRes.data as any;
      const rowPlan = row?.plans as SubscriptionPlan | undefined;
      const expires = row?.expires_at ? new Date(row.expires_at) : null;
      const isExpired = expires ? expires < new Date() : false;
      const hasActivePlan = !!row && row.status === 'active' && !isExpired && Number(rowPlan?.price) > 0;

      // Sem assinatura paga ativa => plano gratuito. Nunca "premium por omissão".
      const plan = hasActivePlan ? rowPlan! : freePlan;

      const proposalsUsed = proposalsRes.count ?? 0;
      const clientsUsed = clientsRes.count ?? 0;
      const maxProposals = isAdmin ? null : plan.max_proposals;
      const maxClients = isAdmin ? null : plan.max_clients;

      const proposalLimitReached = reachedLimit(proposalsUsed, maxProposals);
      const clientLimitReached = reachedLimit(clientsUsed, maxClients);

      return {
        plan,
        planName: plan.name,
        isFree: !hasActivePlan,
        isPaid: hasActivePlan,
        status: hasActivePlan ? row.status : row?.status ?? 'free',
        starts_at: row?.starts_at ?? null,
        expires_at: row?.expires_at ?? null,
        stripe_customer_id: row?.stripe_customer_id ?? null,
        stripe_subscription_id: row?.stripe_subscription_id ?? null,
        isExpired,
        hasActivePlan,
        proposalsUsed,
        clientsUsed,
        maxProposals,
        maxClients,
        proposalsUnlimited: isUnlimited(maxProposals),
        clientsUnlimited: isUnlimited(maxClients),
        canCreateProposal: !proposalLimitReached,
        canCreateClient: !clientLimitReached,
        proposalLimitReached,
        clientLimitReached,
      };
    },
  });

  const fallback: SubscriptionState = {
    plan: null,
    planName: FALLBACK_FREE.name,
    isFree: true,
    isPaid: false,
    status: 'free',
    starts_at: null,
    expires_at: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    isExpired: false,
    hasActivePlan: false,
    proposalsUsed: 0,
    clientsUsed: 0,
    maxProposals: FALLBACK_FREE.max_proposals,
    maxClients: FALLBACK_FREE.max_clients,
    proposalsUnlimited: false,
    clientsUnlimited: false,
    // enquanto carrega, não bloquear nem disparar upgrade
    canCreateProposal: true,
    canCreateClient: true,
    proposalLimitReached: false,
    clientLimitReached: false,
  };

  return { ...(query.data ?? fallback), isLoading: query.isLoading, isReady: !!query.data };
}

/** Flags de recurso derivadas do MESMO plano resolvido. */
export function useFeatureFlag(
  flag: 'allow_pdf_export' | 'allow_templates' | 'allow_custom_branding'
): boolean {
  const { isAdmin } = useAuth();
  const sub = useSubscription();
  if (isAdmin) return true;
  if (!sub.hasActivePlan) return false;
  return Boolean((sub.plan as any)?.[flag]);
}

/** Free não personaliza marca — proposta sai com identidade Orca. */
export function useCanCustomBrand(): boolean {
  const { isAdmin } = useAuth();
  const sub = useSubscription();
  if (isAdmin) return true;
  return sub.hasActivePlan;
}
