/**
 * Google Ads (gtag.js) — tag AW-18401533293.
 *
 * Assim como o Meta Pixel, só carrega em produção real (orca-mento.app)
 * para não contaminar as campanhas com acessos de preview/dev.
 */

export const GOOGLE_ADS_ID = 'AW-18401533293';

const PRODUCTION_HOSTS = ['orca-mento.app', 'www.orca-mento.app'];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isProductionAds(): boolean {
  if (typeof window === 'undefined') return false;
  return PRODUCTION_HOSTS.includes(window.location.hostname);
}

/** Carrega o gtag.js e configura a tag do Google Ads. No-op fora de produção. */
export function initGoogleAds(): void {
  if (!isProductionAds()) return;
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[src*="gtag/js?id=${GOOGLE_ADS_ID}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GOOGLE_ADS_ID);
}

/**
 * Dispara uma conversão do Google Ads.
 * `sendTo` é o rótulo de conversão criado no painel do Google Ads
 * (ex: 'AW-18401533293/AbCdEfGh'). No-op fora de produção.
 */
export function trackGoogleAdsConversion(
  sendTo: string,
  data?: Record<string, unknown>,
): void {
  if (!isProductionAds()) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', { send_to: sendTo, ...(data ?? {}) });
}
