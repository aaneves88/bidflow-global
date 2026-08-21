import type { ProposalItem } from '@/hooks/useProposals';

export type Translate = (key: string, opts?: Record<string, unknown>) => string;

export type ProposalTemplateId = 'simple' | 'phased' | 'recurring';

/** Ordem exibida ao usuário: Consultoria, Design, Marketing (igual à landing). */
export const PROPOSAL_TEMPLATE_IDS: ProposalTemplateId[] = ['phased', 'simple', 'recurring'];

type ItemSeed = { key: string; quantity: number; unit_price: number };

type TemplateSeed = {
  id: ProposalTemplateId;
  /** Validade sugerida da proposta, em dias a partir de hoje. */
  validDays: number;
  items: ItemSeed[];
};

const SEEDS: Record<ProposalTemplateId, TemplateSeed> = {
  // Design — conceito único + até 2 rodadas de ajuste
  simple: {
    id: 'simple',
    validDays: 15,
    items: [
      { key: 'concept', quantity: 1, unit_price: 1200 },
      { key: 'applications', quantity: 1, unit_price: 300 },
    ],
  },
  // Consultoria — diagnóstico → plano de ação → acompanhamento
  phased: {
    id: 'phased',
    validDays: 15,
    items: [
      { key: 'diagnosis', quantity: 1, unit_price: 800 },
      { key: 'actionPlan', quantity: 1, unit_price: 2500 },
      { key: 'followUp', quantity: 1, unit_price: 600 },
    ],
  },
  // Marketing — pacote mensal recorrente
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
