/**
 * Platform detection helpers.
 *
 * We import Capacitor lazily and defensively so the web bundle keeps working
 * even when @capacitor/core is not installed in a given environment.
 */

let cachedIsNative: boolean | null = null;
let cachedPlatform: 'web' | 'android' | 'ios' | null = null;

function detect(): { isNative: boolean; platform: 'web' | 'android' | 'ios' } {
  if (cachedIsNative !== null && cachedPlatform !== null) {
    return { isNative: cachedIsNative, platform: cachedPlatform };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Capacitor } = require('@capacitor/core');
    const isNative = !!Capacitor?.isNativePlatform?.();
    const platform = (Capacitor?.getPlatform?.() ?? 'web') as 'web' | 'android' | 'ios';
    cachedIsNative = isNative;
    cachedPlatform = platform;
    return { isNative, platform };
  } catch {
    cachedIsNative = false;
    cachedPlatform = 'web';
    return { isNative: false, platform: 'web' };
  }
}

export function isNativeMobile(): boolean {
  return detect().isNative;
}

export function isAndroidNative(): boolean {
  const { isNative, platform } = detect();
  return isNative && platform === 'android';
}

export function isIosNative(): boolean {
  const { isNative, platform } = detect();
  return isNative && platform === 'ios';
}

export function getPlatform(): 'web' | 'android' | 'ios' {
  return detect().platform;
}
