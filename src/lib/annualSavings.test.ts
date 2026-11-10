import { describe, it, expect } from 'vitest';
import { annualSavingsPercent } from './annualSavings';

describe('annualSavingsPercent', () => {
  it('R$29/mês vs R$299/ano economiza 14%', () => {
    expect(annualSavingsPercent(29, 299)).toBe(14);
  });
  it('sem desconto quando anual >= 12x mensal', () => {
    expect(annualSavingsPercent(29, 348)).toBe(0);
  });
});
