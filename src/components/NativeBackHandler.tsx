import { useEffect } from 'react';
import { isNativeMobile } from '@/lib/platform';

/**
 * Wires the Android hardware back button to browser history.
 * - If there is history, goes back.
 * - Otherwise, exits the app.
 * No-op on web/iOS.
 */
export function NativeBackHandler() {
  useEffect(() => {
    if (!isNativeMobile()) return;
    let remove: (() => void) | undefined;

    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        const handle = await App.addListener('backButton', () => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
        remove = () => handle.remove();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[NativeBackHandler] not available', err);
      }
    })();

    return () => {
      remove?.();
    };
  }, []);

  return null;
}
