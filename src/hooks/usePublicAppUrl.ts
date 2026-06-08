import { useAppSettings } from './useAppSettings';

/**
 * Returns the canonical public-facing base URL configured by the admin
 * (e.g. https://your-brand.com). Falls back to window.location.origin when
 * not configured — but the configured value is preferred so links sent to
 * clients don't point to preview/sandbox URLs that require auth.
 */
export function usePublicAppUrl(): string {
  const { getSetting } = useAppSettings('general');
  const configured = (getSetting('public_app_url') as string) || '';
  if (configured) return configured.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function buildPublicProposalUrl(base: string, code: string) {
  return `${base.replace(/\/+$/, '')}/p/${code}`;
}
