/** Percent saved paying yearly vs 12 monthly payments (rounded down). 0 when not applicable. */
export function annualSavingsPercent(monthly: number, annual: number): number {
  if (!monthly || !annual || monthly <= 0 || annual <= 0) return 0;
  const full = monthly * 12;
  if (annual >= full) return 0;
  return Math.floor(((full - annual) / full) * 100);
}
