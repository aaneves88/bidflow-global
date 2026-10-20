/** Normaliza telefone BR para wa.me (adiciona 55 quando faltar). Retorna null se inválido. */
export function toWhatsAppNumber(phone?: string | null): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.length <= 11) return `55${digits}`;
  return digits;
}

export function whatsAppUrl(phone: string | null | undefined, message: string): string | null {
  const n = toWhatsAppNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}
