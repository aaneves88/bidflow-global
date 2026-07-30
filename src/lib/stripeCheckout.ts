/**
 * Builds the Stripe Payment Link URL with the identifiers the webhook needs
 * to match the payment to the correct Orca account.
 */
export function getStripePaymentLink(user?: { id?: string; email?: string | null } | null): string | null {
  const base = import.meta.env.VITE_STRIPE_PAYMENT_LINK as string | undefined;
  if (!base) return null;

  const url = new URL(base);
  if (user?.id) url.searchParams.set('client_reference_id', user.id);
  if (user?.email) url.searchParams.set('prefilled_email', user.email);
  return url.toString();
}
