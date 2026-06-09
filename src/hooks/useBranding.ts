import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Branding = {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
};

/** Orca defaults — also used as the visible brand for free-tier proposals. */
export const ORCA_BRANDING: Branding = {
  logoUrl: '',
  primaryColor: '#06B6D4', // cyan
  secondaryColor: '#0F172A', // slate
  accentColor: '#22C55E',
  companyName: 'Orca',
};

const DEFAULTS: Branding = {
  logoUrl: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#1F2937',
  accentColor: '#22C55E',
  companyName: '',
};

/** Per-user branding stored on the user's profile. */
export function useBranding(): Branding & { isLoading: boolean } {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['user-branding', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('company_name, logo_url, primary_color, secondary_color, accent_color')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return {
    logoUrl: data?.logo_url || DEFAULTS.logoUrl,
    primaryColor: data?.primary_color || DEFAULTS.primaryColor,
    secondaryColor: data?.secondary_color || DEFAULTS.secondaryColor,
    accentColor: data?.accent_color || DEFAULTS.accentColor,
    companyName: data?.company_name || DEFAULTS.companyName,
    isLoading,
  };
}

export function useUpdateBranding() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<{
      company_name: string;
      logo_url: string;
      primary_color: string;
      secondary_color: string;
      accent_color: string;
    }>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-branding'] });
    },
  });
}

export type PublicBranding = Branding & { hasActivePlan: boolean };

/**
 * Public branding for a shared proposal page. Free-tier owners always show
 * Orca branding; paid owners show their own profile branding.
 */
export async function fetchPublicBranding(supabase: any, publicCode?: string): Promise<PublicBranding> {
  if (!publicCode) {
    return { ...ORCA_BRANDING, hasActivePlan: false };
  }
  try {
    const { data, error } = await supabase.rpc('get_proposal_branding', { p_code: publicCode });
    if (error || !data || data.length === 0) {
      return { ...ORCA_BRANDING, hasActivePlan: false };
    }
    const row = data[0];
    const hasActivePlan = !!row.has_active_plan;
    if (!hasActivePlan) {
      return { ...ORCA_BRANDING, hasActivePlan: false };
    }
    return {
      logoUrl: row.logo_url || ORCA_BRANDING.logoUrl,
      primaryColor: row.primary_color || ORCA_BRANDING.primaryColor,
      secondaryColor: row.secondary_color || ORCA_BRANDING.secondaryColor,
      accentColor: row.accent_color || ORCA_BRANDING.accentColor,
      companyName: row.company_name || '',
      hasActivePlan: true,
    };
  } catch {
    return { ...ORCA_BRANDING, hasActivePlan: false };
  }
}
