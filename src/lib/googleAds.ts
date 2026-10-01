/**
 * Google Ads (gtag.js) — tag AW-18401533293.
 *
 * Este módulo é o dono oficial da tag do Google Ads no Orca: o contêiner do
 * Google Tag Manager (`GTM-TZHKGXJ4`) continua no site, mas não deve conter
 * tags do Google Ads (ver docs/releases/v0.8.3-google-ads.md).
 *
 * Regras:
 * - Só carrega em produção real (orca-mento.app), como o Meta Pixel, para não
 *   contaminar as campanhas com acessos de preview/dev.
 * - A fila `dataLayer` e o comando `gtag` são sempre garantidos: se o Tag
 *   Manager tiver carregado o gtag.js antes de nós, a cópia dele pode não
 *   expor `window.gtag`, e sem isso as conversões sumiriam em silêncio.
 * - O script é baixado pelo app apenas quando ninguém baixou ainda, e o
 *   `config` (que gera o aviso de página) só é enviado junto do nosso próprio
 *   download — nunca duas vezes para o mesmo visitante.
 */

export const GOOGLE_ADS_ID = 'AW-18401533293';

const PRODUCTION_HOSTS = ['orca-mento.app', 'www.orca-mento.app'];

/** Marca as cópias baixadas por este módulo, para reconhecer duplicação própria. */
const OWN_SCRIPT_ATTR = 'data-orca-ads';

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

/** Garante a fila `dataLayer` (criada pelo Tag Manager ou por nós). */
function ensureDataLayer(): unknown[] {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/**
 * Garante o comando `gtag`. A cópia do gtag.js injetada pelo Tag Manager não
 * necessariamente expõe `window.gtag`, então definimos um equivalente que
 * apenas empurra os argumentos para a `dataLayer` — exatamente o contrato do
 * gtag.js original.
 */
function ensureGtag(): (...args: unknown[]) => void {
  const dataLayer = ensureDataLayer();
  if (typeof window.gtag !== 'function') {
    window.gtag = (...args: unknown[]) => {
      dataLayer.push(args);
    };
  }
  return window.gtag;
}

/** Alguma cópia do gtag.js desta conta já está na página (nossa ou do GTM)? */
function gtagScriptInPage(): boolean {
  return !!document.querySelector(`script[src*="gtag/js?id=${GOOGLE_ADS_ID}"]`);
}

/**
 * Inicializa a tag do Google Ads. No-op fora de produção.
 *
 * Chamar mais de uma vez é seguro: nada é carregado ou configurado duas vezes.
 */
export function initGoogleAds(): void {
  if (!isProductionAds()) return;
  if (typeof document === 'undefined') return;

  ensureGtag();

  if (gtagScriptInPage()) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  script.setAttribute(OWN_SCRIPT_ATTR, GOOGLE_ADS_ID);
  document.head.appendChild(script);

  window.gtag?.('js', new Date());
  window.gtag?.('config', GOOGLE_ADS_ID);
}

/**
 * Dispara uma conversão do Google Ads.
 *
 * `sendTo` é o rótulo de conversão criado no painel do Google Ads
 * (ex: 'AW-18401533293/AbCdEfGh'). No-op fora de produção.
 *
 * Se o comando `gtag` não estiver disponível, escrevemos direto na `dataLayer`
 * — é a mesma coisa que o gtag faria — para que a conversão nunca seja
 * descartada em silêncio.
 */
export function trackGoogleAdsConversion(
  sendTo: string,
  data?: Record<string, unknown>,
): void {
  if (!isProductionAds()) return;
  if (!sendTo) return;

  const payload: Record<string, unknown> = { send_to: sendTo, ...(data ?? {}) };

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', payload);
    return;
  }
  ensureDataLayer().push(['event', 'conversion', payload]);
}
