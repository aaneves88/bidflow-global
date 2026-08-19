import { supabase } from '@/integrations/supabase/client';
import { attributionForProfile } from '@/lib/attribution';

/**
 * Grava a origem do cadastro no perfil do usuário logado.
 * Só escreve uma vez: se o perfil já tiver origem registrada, não sobrescreve.
 */
export async function persistSignupAttribution(): Promise<void> {
  try {
    const fields = attributionForProfile();
    const hasAny = Object.values(fields).some(Boolean);
    if (!hasAny) return;

    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('signup_utm_source, signup_referrer')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.signup_utm_source || profile?.signup_referrer) return;

    await supabase.from('profiles').update(fields).eq('id', userId);
  } catch {
    /* atribuição é best-effort: nunca bloqueia o cadastro */
  }
}
