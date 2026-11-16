import { describe, expect, it } from 'vitest';
import { summarizeUsage, averageByCurrency } from './proposalUsage';

describe('proposal usage', () => {
  it('keeps owner PDF exports distinct from public downloads and sharing attempts', () => {
    const events = ['pdf_owner', 'pdf_owner', 'pdf_public', 'link_copied', 'whatsapp_opened', 'email_sent'] as const;
    expect(summarizeUsage(events.map(event_type => ({ proposal_id: 'p', event_type, created_at: '2026-11-16' })))).toEqual({ pdfOwner: 2, pdfPublic: 1, copied: 1, whatsapp: 1, email: 1 });
  });
  it('never mixes currencies in average proposal values', () => {
    expect(averageByCurrency([{ currency: 'BRL', total_amount: 100 }, { currency: 'BRL', total_amount: 300 }, { currency: 'USD', total_amount: 50 }])).toEqual({ BRL: 200, USD: 50 });
  });
});