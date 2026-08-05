/**
 * Limites de plano: -1 e null significam "ilimitado".
 * Nunca comparar/exibir o sentinel diretamente — usar estes helpers.
 */
export function isUnlimited(limit: number | null | undefined): boolean {
  return limit === -1 || limit === null || limit === undefined;
}

/** Limite atingido só existe quando o limite é finito. */
export function reachedLimit(used: number, limit: number | null | undefined): boolean {
  return !isUnlimited(limit) && used >= (limit as number);
}

/** Percentual de uso (0 quando ilimitado). */
export function usagePercent(used: number, limit: number | null | undefined): number {
  if (isUnlimited(limit) || (limit as number) <= 0) return 0;
  return Math.min(100, (used / (limit as number)) * 100);
}
