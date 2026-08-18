// No navegador (fora do preview em iframe) o login social faz redirect de página
// inteira e o broker devolve os tokens NA URL de retorno. O SDK não tem handler
// de callback — é o app que precisa ler esses tokens e gravar a sessão.

import { supabase } from '@/integrations/supabase/client';

const NEXT_KEY = 'orca:oauth:next';

export type OAuthTokens = { access_token: string; refresh_token: string };

function paramsFromUrl(): URLSearchParams {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  hash.forEach((value, key) => {
    if (!search.has(key)) search.append(key, value);
  });
  return search;
}

/** Lê tokens devolvidos pelo provedor, na query ou no hash. */
export function readOAuthTokens(): OAuthTokens | null {
  if (typeof window === 'undefined') return null;
  const params = paramsFromUrl();
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

/** true quando a URL atual carrega retorno de OAuth (tokens ou erro). */
export function hasOAuthReturn(): boolean {
  if (typeof window === 'undefined') return false;
  const params = paramsFromUrl();
  return !!(params.get('access_token') || params.get('error') || params.get('error_code'));
}

export function clearOAuthTokens() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  ['access_token', 'refresh_token', 'expires_in', 'expires_at', 'token_type', 'provider_token', 'state'].forEach(
    (k) => url.searchParams.delete(k),
  );
  url.hash = '';
  window.history.replaceState({}, '', url.pathname + url.search);
}

/** Grava a sessão a partir dos tokens da URL. Retorna true se autenticou. */
export async function consumeOAuthTokens(): Promise<boolean> {
  const tokens = readOAuthTokens();
  if (!tokens) return false;
  const { error } = await supabase.auth.setSession(tokens);
  clearOAuthTokens();
  return !error;
}

function isSafePath(value: string | null): value is string {
  return !!value && value.startsWith('/') && !value.startsWith('//');
}

/** Guarda o destino pretendido — nunca vai na URL do provedor. */
export function rememberOAuthNext(path: string | null | undefined) {
  if (typeof window === 'undefined') return;
  if (isSafePath(path ?? null)) {
    sessionStorage.setItem(NEXT_KEY, path as string);
  } else {
    sessionStorage.removeItem(NEXT_KEY);
  }
}

export function takeOAuthNext(): string {
  if (typeof window === 'undefined') return '/dashboard';
  const stored = sessionStorage.getItem(NEXT_KEY);
  sessionStorage.removeItem(NEXT_KEY);
  return isSafePath(stored) ? stored : '/dashboard';
}

export const OAUTH_CALLBACK_PATH = '/auth/callback';
