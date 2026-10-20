import { describe, it, expect } from 'vitest';
import { isValidPaymentLink } from './paymentLink';

describe('isValidPaymentLink', () => {
  it('accepts https links', () => expect(isValidPaymentLink('https://mpago.la/abc')).toBe(true));
  it('rejects http links', () => expect(isValidPaymentLink('http://mpago.la/abc')).toBe(false));
  it('rejects javascript links', () => expect(isValidPaymentLink('javascript:alert(1)')).toBe(false));
});
