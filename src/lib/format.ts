import i18n from '@/i18n';

function getLocale() {
  const lang = i18n.language || 'pt-BR';
  return lang === 'en' ? 'en-US' : 'pt-BR';
}

function defaultCurrency() {
  return i18n.language === 'en' ? 'USD' : 'BRL';
}

export function formatCurrency(amount: number, currency?: string) {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: currency || defaultCurrency(),
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function generatePublicCode() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}
