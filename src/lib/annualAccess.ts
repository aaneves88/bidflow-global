/** Paid access: active (not expired), or annual past_due still inside the paid 12 months. */
export function isPaidAccessActive(o: {
  status?: string | null; expiresAt: string | null; price: number; interval: string | null; now?: Date;
}): boolean {
  if (!(o.price > 0)) return false;
  const now = o.now ?? new Date();
  const notExpired = !o.expiresAt || new Date(o.expiresAt) >= now;
  if (o.status === 'active') return notExpired;
  if (o.status === 'past_due' && o.interval === 'year') return !!o.expiresAt && notExpired;
  return false;
}

/** Same calendar date one year later. */
export function annualExpiry(start: Date): Date {
  const d = new Date(start);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}
