// Lê e limpa erros devolvidos pelo provedor OAuth na volta do redirect.
// O Supabase/Lovable devolve o erro tanto na query (?error=...) quanto no hash (#error=...).

export type OAuthErrorInfo = {
  code: string;
  description: string;
  /** true quando o e-mail já pertence a uma conta criada com e-mail/senha */
  identityConflict: boolean;
};

const CONFLICT_HINTS = [
  'identity_already_exists',
  'email_exists',
  'user_already_exists',
  'already registered',
  'already exists',
  'manual linking',
];

export function readOAuthError(): OAuthErrorInfo | null {
  if (typeof window === 'undefined') return null;

  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  const code = search.get('error_code') || search.get('error') || hash.get('error_code') || hash.get('error');
  if (!code) return null;

  const description =
    search.get('error_description') || hash.get('error_description') || '';

  const haystack = `${code} ${description}`.toLowerCase();

  return {
    code,
    description,
    identityConflict: CONFLICT_HINTS.some((hint) => haystack.includes(hint)),
  };
}

export function clearOAuthError() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  ['error', 'error_code', 'error_description', 'state'].forEach((k) => url.searchParams.delete(k));
  if (/error/.test(url.hash)) url.hash = '';
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}

export function isUserCancelled(info: OAuthErrorInfo): boolean {
  const haystack = `${info.code} ${info.description}`.toLowerCase();
  return haystack.includes('access_denied') || haystack.includes('cancel');
}
