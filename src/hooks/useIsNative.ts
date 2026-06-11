import { useEffect, useState } from 'react';
import { isNativeMobile } from '@/lib/platform';

/**
 * Reactive boolean indicating whether the app is running inside a Capacitor
 * native shell (Android/iOS). Returns false on web. Safe for SSR (starts
 * false, then resolves on mount).
 */
export function useIsNative(): boolean {
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(isNativeMobile());
  }, []);
  return native;
}
