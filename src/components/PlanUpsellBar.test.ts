import { describe, it, expect } from 'vitest';
import { shouldShowUpsell, UPSELL_SNOOZE_MS } from './PlanUpsellBar';

describe('shouldShowUpsell', () => {
  const now = 1_000_000_000_000;
  it('hides for 3 days after dismiss', () => {
    expect(shouldShowUpsell(now - UPSELL_SNOOZE_MS + 1000, now, false)).toBe(false);
  });
  it('shows again after 3 days', () => {
    expect(shouldShowUpsell(now - UPSELL_SNOOZE_MS, now, false)).toBe(true);
  });
  it('always shows near the limit even if dismissed', () => {
    expect(shouldShowUpsell(now, now, true)).toBe(true);
  });
});
