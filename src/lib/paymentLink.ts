/** Owner's own card payment link (Mercado Pago, PagSeguro…). Only https links are accepted. */
export function isValidPaymentLink(raw: string): boolean {
  const v = raw.trim();
  if (!/^https:\/\//i.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && u.hostname.includes('.');
  } catch {
    return false;
  }
}
