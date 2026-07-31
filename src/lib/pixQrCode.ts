/**
 * PIX BR Code (EMV) payload — Banco Central standard.
 *
 * Orca never processes the payment: this only encodes the freelancer's own key
 * so their client can pay them directly through their bank app.
 *
 * Thin, explicit entry point built on top of `src/lib/pix.ts` helpers.
 */
import { buildPixPayload, normalizePixKey, type PixKeyType } from './pix';

export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  /** Optional key type used to normalize the key (CPF digits only, +55 phones, etc). */
  pixKeyType?: PixKeyType | string | null;
  /** Optional transaction reference. Defaults to '***'. */
  txid?: string;
}

export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  pixKeyType,
  txid,
}: PixPayloadParams): string {
  return buildPixPayload({
    key: normalizePixKey(pixKey, pixKeyType),
    keyType: pixKeyType,
    merchantName,
    merchantCity,
    amount,
    txid,
  });
}

export { normalizePixKey };
export type { PixKeyType };
