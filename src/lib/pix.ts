/**
 * PIX BR Code (EMV) payload generation.
 * Orca never processes the payment — this only renders the freelancer's own key.
 */

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Strip accents/special chars — BR Code only accepts a limited ASCII set. */
function sanitize(text: string, maxLength: number): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 .\-]/g, '')
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

/** Normalizes the key to the format banks expect for each type. */
export function normalizePixKey(key: string, type?: PixKeyType | string | null): string {
  const raw = (key || '').trim();
  switch (type) {
    case 'cpf':
    case 'cnpj':
      return raw.replace(/\D/g, '');
    case 'phone': {
      const digits = raw.replace(/\D/g, '');
      if (raw.startsWith('+')) return `+${digits}`;
      return digits.length <= 11 ? `+55${digits}` : `+${digits}`;
    }
    case 'email':
      return raw.toLowerCase();
    default:
      return raw;
  }
}

export function isValidPixKey(key: string, type: PixKeyType): boolean {
  const v = normalizePixKey(key, type);
  switch (type) {
    case 'cpf':
      return /^\d{11}$/.test(v);
    case 'cnpj':
      return /^\d{14}$/.test(v);
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 77;
    case 'phone':
      return /^\+\d{12,14}$/.test(v);
    case 'random':
      return /^[0-9a-fA-F-]{32,36}$/.test(v);
    default:
      return false;
  }
}

interface PixPayloadInput {
  key: string;
  keyType?: PixKeyType | string | null;
  merchantName: string;
  merchantCity?: string;
  /** Transaction amount in BRL. Omit / 0 for an open-value code. */
  amount?: number;
  /** Free-form reference (txid). Defaults to '***'. */
  txid?: string;
}

/** Builds a static PIX "Copia e Cola" payload following the BCB EMV standard. */
export function buildPixPayload({
  key,
  keyType,
  merchantName,
  merchantCity,
  amount,
  txid,
}: PixPayloadInput): string {
  const normalizedKey = normalizePixKey(key, keyType);
  const name = sanitize(merchantName || 'RECEBEDOR', 25) || 'RECEBEDOR';
  const city = sanitize(merchantCity || 'BRASIL', 15) || 'BRASIL';
  const reference = sanitize(txid || '***', 25) || '***';

  const merchantAccount = tlv('00', 'br.gov.bcb.pix') + tlv('01', normalizedKey);

  let payload =
    tlv('00', '01') +
    tlv('26', merchantAccount) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (amount && amount > 0 ? tlv('54', amount.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', name) +
    tlv('60', city) +
    tlv('62', tlv('05', reference === '***' ? '***' : reference));

  payload += '6304';
  return payload + crc16(payload);
}

export const PIX_KEY_TYPES: PixKeyType[] = ['cpf', 'cnpj', 'email', 'phone', 'random'];
