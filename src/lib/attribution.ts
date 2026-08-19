/**
 * Rastreio de origem (atribuição) da primeira visita.
 *
 * Captura UTMs da URL na primeira entrada do usuário; se não houver UTM,
 * guarda o domínio do referrer (para tráfego orgânico de Instagram/Facebook).
 * Persiste em localStorage por 30 dias, para sobreviver à navegação até o
 * cadastro ou o download do e-book.
 */

const STORAGE_KEY = 'orca_attribution';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_path: string | null;
  captured_at: number;
}

function clean(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, 200);
  return trimmed.length ? trimmed : null;
}

function referrerDomain(): string | null {
  if (typeof document === 'undefined') return null;
  const ref = document.referrer;
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '');
    if (!host || host === window.location.hostname.replace(/^www\./, '')) return null;
    return host;
  } catch {
    return null;
  }
}

export function readAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    if (!parsed?.captured_at || Date.now() - parsed.captured_at > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Captura a origem na primeira visita. Não sobrescreve uma atribuição
 * válida já existente, exceto quando a nova visita traz UTMs explícitas.
 */
export function captureAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const utm = {
    utm_source: clean(params.get('utm_source')),
    utm_medium: clean(params.get('utm_medium')),
    utm_campaign: clean(params.get('utm_campaign')),
    utm_content: clean(params.get('utm_content')),
  };
  const hasUtm = Object.values(utm).some(Boolean);
  const existing = readAttribution();

  if (existing && !hasUtm) return existing;

  const next: Attribution = {
    ...utm,
    referrer: hasUtm ? referrerDomain() : referrerDomain(),
    landing_path: clean(window.location.pathname),
    captured_at: Date.now(),
  };

  if (!hasUtm && !next.referrer) return existing;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* localStorage indisponível (modo privado) */
  }
  return next;
}

/** Campos de origem para a tabela `ebook_leads`. */
export function attributionForLead() {
  const a = readAttribution();
  return {
    utm_source: a?.utm_source ?? null,
    utm_medium: a?.utm_medium ?? null,
    utm_campaign: a?.utm_campaign ?? null,
    utm_content: a?.utm_content ?? null,
    referrer: a?.referrer ?? null,
    landing_path: a?.landing_path ?? null,
  };
}

/** Campos de origem para a tabela `profiles` (cadastro). */
export function attributionForProfile() {
  const a = readAttribution();
  return {
    signup_utm_source: a?.utm_source ?? null,
    signup_utm_medium: a?.utm_medium ?? null,
    signup_utm_campaign: a?.utm_campaign ?? null,
    signup_utm_content: a?.utm_content ?? null,
    signup_referrer: a?.referrer ?? null,
    signup_landing_path: a?.landing_path ?? null,
  };
}
