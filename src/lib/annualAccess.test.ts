import { describe, it, expect } from 'vitest';
import { annualExpiry, isPaidAccessActive } from './annualAccess';
const now = new Date('2026-11-10T12:00:00Z');
describe('plano anual', () => {
  it('pago hoje vale até a mesma data do ano seguinte', () => {
    expect(annualExpiry(now).toISOString()).toBe('2027-11-10T12:00:00.000Z');
  });
  it('renovação falhou: continua Premium dentro dos 12 meses', () => {
    expect(isPaidAccessActive({ status: 'past_due', expiresAt: '2027-11-10T12:00:00Z', price: 299, interval: 'year', now })).toBe(true);
  });
  it('depois dos 12 meses volta ao Grátis', () => {
    expect(isPaidAccessActive({ status: 'active', expiresAt: '2026-11-09T12:00:00Z', price: 299, interval: 'year', now })).toBe(false);
  });
  it('mensal com pagamento falhando perde o acesso', () => {
    expect(isPaidAccessActive({ status: 'past_due', expiresAt: null, price: 29, interval: 'month', now })).toBe(false);
  });
});
