import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAndroidNative, isIosNative, isNativeMobile } from '@/lib/platform';

/**
 * Initializes RevenueCat on native platforms and keeps the RC user in sync
 * with the authenticated Lovable Cloud user. No-op on web.
 *
 * Required env (set per-platform when shipping the native build):
 * - VITE_REVENUECAT_ANDROID_KEY (public Android SDK key)
 * - VITE_REVENUECAT_IOS_KEY     (public iOS SDK key — for the future)
 */
export function useRevenueCatBootstrap() {
  const { user } = useAuth();

  useEffect(() => {
    if (!isNativeMobile()) return;

    let cancelled = false;

    (async () => {
      try {
        const apiKey = isAndroidNative()
          ? (import.meta.env.VITE_REVENUECAT_ANDROID_KEY as string | undefined)
          : isIosNative()
          ? (import.meta.env.VITE_REVENUECAT_IOS_KEY as string | undefined)
          : undefined;

        if (!apiKey) {
          // eslint-disable-next-line no-console
          console.warn('[RevenueCat] missing public SDK key for platform; skipping init');
          return;
        }

        const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');

        if (cancelled) return;

        await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
        await Purchases.configure({ apiKey, appUserID: user?.id ?? undefined });

        if (user?.id) {
          await Purchases.logIn({ appUserID: user.id });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[RevenueCat] bootstrap failed', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);
}
