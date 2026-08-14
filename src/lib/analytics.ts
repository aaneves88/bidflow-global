/**
 * Helpers para disparo seguro do Meta Pixel.
 *
 * Os eventos só são enviados em produção real (orca-mento.app) para não
 * contaminar campanhas com acessos de preview, staging ou desenvolvimento.
 */

export const META_PIXEL_ID = '1057696769997816';

const PRODUCTION_HOSTS = ['orca-mento.app', 'www.orca-mento.app'];

export function isProductionAnalytics(): boolean {
  if (typeof window === 'undefined') return false;
  return PRODUCTION_HOSTS.includes(window.location.hostname);
}

export function trackMeta(event: string, data?: Record<string, unknown>): void {
  if (!isProductionAnalytics()) return;
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq !== 'function') return;

  if (data && Object.keys(data).length > 0) {
    fbq('track', event, data);
  } else {
    fbq('track', event);
  }
}
