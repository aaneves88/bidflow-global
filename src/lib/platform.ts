/**
 * Platform detection helpers.
 *
 * Capacitor injects a global `window.Capacitor` object at runtime on native
 * platforms. We probe that global instead of importing `@capacitor/core`,
 * which avoids pulling Capacitor's CommonJS interop into the web bundle
 * (which can cause Vite to duplicate React).
 */

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
};

function getCapacitor(): CapacitorGlobal | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

export function isNativeMobile(): boolean {
  const cap = getCapacitor();
  return !!cap?.isNativePlatform?.();
}

export function getPlatform(): 'web' | 'android' | 'ios' {
  const cap = getCapacitor();
  const platform = cap?.getPlatform?.() ?? 'web';
  return platform === 'android' || platform === 'ios' ? platform : 'web';
}

export function isAndroidNative(): boolean {
  return isNativeMobile() && getPlatform() === 'android';
}

export function isIosNative(): boolean {
  return isNativeMobile() && getPlatform() === 'ios';
}
