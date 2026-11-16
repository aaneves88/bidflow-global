import { supabase } from '@/integrations/supabase/client';

export type UsageEventType = 'pdf_owner' | 'pdf_public' | 'link_copied' | 'whatsapp_opened' | 'email_sent';
export type UsageEvent = { proposal_id: string; event_type: UsageEventType; created_at: string };

export async function recordProposalUsage(proposalId: string, eventType: Exclude<UsageEventType, 'pdf_public'>) {
  try {
    const { error } = await supabase.from('proposal_usage_events').insert({ proposal_id: proposalId, event_type: eventType });
    if (error) console.warn('Proposal usage recording failed');
  } catch { /* Usage tracking must not interrupt delivery. */ }
}

export function summarizeUsage(events: UsageEvent[]) {
  return {
    pdfOwner: events.filter(e => e.event_type === 'pdf_owner').length,
    pdfPublic: events.filter(e => e.event_type === 'pdf_public').length,
    copied: events.filter(e => e.event_type === 'link_copied').length,
    whatsapp: events.filter(e => e.event_type === 'whatsapp_opened').length,
    email: events.filter(e => e.event_type === 'email_sent').length,
  };
}

export function averageByCurrency(proposals: { currency: string; total_amount: number }[]) {
  const groups: Record<string, { total: number; count: number }> = {};
  for (const p of proposals) {
    const group = groups[p.currency] ?? { total: 0, count: 0 };
    group.total += Number(p.total_amount);
    group.count++;
    groups[p.currency] = group;
  }
  return Object.fromEntries(Object.entries(groups).map(([currency, group]) => [currency, group.total / group.count]));
}