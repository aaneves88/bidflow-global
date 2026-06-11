import { isNativeMobile } from '@/lib/platform';

/**
 * Opens an external URL. On native (Capacitor) uses the in-app browser so
 * the user stays inside the app shell. On web, opens in a new tab.
 */
export async function openExternal(url: string): Promise<void> {
  if (isNativeMobile()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
      return;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[openExternal] in-app browser failed, falling back', err);
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
