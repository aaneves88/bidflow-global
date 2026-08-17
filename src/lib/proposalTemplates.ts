import type { ProposalItem } from '@/hooks/useProposals';

export type Translate = (key: string, opts?: Record<string, unknown>) => string;

export type ProposalTemplateId = 'simple' | 'phased' | 'recurring';

export const PROPOSAL_TEMPLATE_IDS: ProposalTemplateId[] = ['simple', 'phased', 'recurring'];

type ItemSeed = { key: string; quantity: number; unit_price: number };

type TemplateSeed = {
  id: ProposalTemplateId;
  /** Validade sugerida da proposta, em dias a partir de hoje. */
  validDays: number;
  items: ItemSeed[];
};

const SEEDS: Record<ProposalTemplateId, TemplateSeed> = {
  simple: {
    id: 'simple',
    validDays: 15,
    items: [
      { key: 'service', quantity: 1, unit_price: 1200 },
      { key: 'extra', quantity: 1, unit_price: 300 },
    ],
  },
  phased: {
    id: 'phased',
    validDays: 20,
    items: [
      { key: 'discovery', quantity: 1, unit_price: 800 },
      { key: 'production', quantity: 1, unit_price: 2500 },
      { key: 'review', quantity: 1, unit_price: 600 },
      { key: 'delivery', quantity: 1, unit_price: 400 },
    ],
  },
  recurring: {
    id: 'recurring',
    validDays: 10,
    items: [
      { key: 'monthly', quantity: 1, unit_price: 1500 },
      { key: 'support', quantity: 1, unit_price: 400 },
    ],
  },
};

export type AppliedTemplate = {
  title: string;
  description: string;
  notes: string;
  terms: string;
  validUntil: string;
  items: ProposalItem[];
};

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function buildProposalTemplate(
  id: ProposalTemplateId,
  t: Translate
): AppliedTemplate {
  const seed = SEEDS[id];
  const tr = (suffix: string) => t(`templates.items.${id}.${suffix}`);
  const validUntil = addDays(seed.validDays);
  const deliveryDate = addDays(seed.validDays + 30);

  return {
    title: t(`templates.options.${id}.proposalTitle`),
    description: t(`templates.options.${id}.proposalDescription`),
    notes: t(`templates.options.${id}.notes`, { date: formatDate(deliveryDate) }),
    terms: t(`templates.options.${id}.terms`, { date: formatDate(validUntil) }),
    validUntil,
    items: seed.items.map((item, idx) => ({
      description: tr(item.key),
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      position: idx,
    })),
  };
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
