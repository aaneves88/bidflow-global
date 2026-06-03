import { useAppSettings } from './useAppSettings';

export type Branding = {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
};

const DEFAULTS: Branding = {
  logoUrl: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#1F2937',
  accentColor: '#22C55E',
  companyName: '',
};

export function useBranding(): Branding & { isLoading: boolean } {
  const branding = useAppSettings('branding');
  const general = useAppSettings('general');
  const isLoading = branding.isLoading || general.isLoading;

  return {
    logoUrl: (branding.getSetting('logo_url') as string) || DEFAULTS.logoUrl,
    primaryColor: (branding.getSetting('primary_color') as string) || DEFAULTS.primaryColor,
    secondaryColor: (branding.getSetting('secondary_color') as string) || DEFAULTS.secondaryColor,
    accentColor: (branding.getSetting('accent_color') as string) || DEFAULTS.accentColor,
    companyName: (general.getSetting('company_name') as string) || DEFAULTS.companyName,
    isLoading,
  };
}

/** Returns a public branding read (works for anon / public proposal page). */
export async function fetchPublicBranding(supabase: any): Promise<Branding> {
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['logo_url', 'primary_color', 'secondary_color', 'accent_color', 'company_name']);
    const map: Record<string, any> = {};
    (data || []).forEach((r: any) => { map[r.key] = r.value; });
    return {
      logoUrl: map.logo_url || DEFAULTS.logoUrl,
      primaryColor: map.primary_color || DEFAULTS.primaryColor,
      secondaryColor: map.secondary_color || DEFAULTS.secondaryColor,
      accentColor: map.accent_color || DEFAULTS.accentColor,
      companyName: map.company_name || DEFAULTS.companyName,
    };
  } catch {
    return DEFAULTS;
  }
}
