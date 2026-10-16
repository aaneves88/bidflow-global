import { describe, it, expect } from 'vitest';
import { shouldRequireTaxId } from './useTaxIdGate';

const base = { isAdmin: false, plansReady: true, isFree: true, taxIdLoading: false, taxId: null };

describe('shouldRequireTaxId (only when sharing)', () => {
  it('free user without document must provide it before sharing', () => {
    expect(shouldRequireTaxId(base)).toBe(true);
  });
  it('free user with document shares freely', () => {
    expect(shouldRequireTaxId({ ...base, taxId: '12345678909' })).toBe(false);
  });
  it('paid users are never asked', () => {
    expect(shouldRequireTaxId({ ...base, isFree: false })).toBe(false);
  });
  it('admins are never asked', () => {
    expect(shouldRequireTaxId({ ...base, isAdmin: true })).toBe(false);
  });
});
