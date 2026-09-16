import { supabase } from '@/integrations/supabase/client';
import { readAttribution, readNicheOrigin } from '@/lib/attribution';

/**
 * Eventos de marketing que podem ser gravados por visitante anônimo
 * (a policy de INSERT para `anon` em `product_events` exige esta lista).
 */
const ANON_EVENTS = [
  'niche_page_viewed',
  'niche_template_copied',
  'niche_cta_clicked',
  'hub_niche_clicked',
] as const;

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
    const isAnonAllowed = (ANON_EVENTS as readonly string[]).includes(eventName);
    // Sem usuário só é permitido para os eventos de marketing (RLS)
    if (!userId && !isAnonAllowed) return;

    const a = readAttribution();
    const niche = readNicheOrigin();
    const props = {
      ...(properties ?? {}),
      ...(niche && !properties?.niche ? { niche } : {}),
    };

    await supabase.from('product_events').insert({
      user_id: userId,
      event_name: eventName,
      properties: (Object.keys(props).length ? props : null) as never,
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
