import { supabase } from '@/integrations/supabase/client';
import { readAttribution } from '@/lib/attribution';

/**
 * Registra um evento de funil em `product_events`.
 *
 * Best-effort: nunca lança erro para o chamador (mesmo padrão de
 * `attributionSync.ts`). Roda em qualquer ambiente — é dado nosso,
 * diferente do Meta Pixel, que só dispara em produção.
 */
export async function trackProductEvent(
  eventName: string,
  userId: string | null,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    if (!userId) return; // RLS exige user_id = auth.uid()
    const a = readAttribution();
    await supabase.from('product_events').insert({
      user_id: userId,
      event_name: eventName,
      properties: (properties ?? null) as never,
      utm_source: a?.utm_source ?? null,
      utm_medium: a?.utm_medium ?? null,
      utm_campaign: a?.utm_campaign ?? null,
      utm_content: a?.utm_content ?? null,
      referrer: a?.referrer ?? null,
    });
  } catch {
    /* telemetria nunca bloqueia o fluxo do usuário */
  }
}
