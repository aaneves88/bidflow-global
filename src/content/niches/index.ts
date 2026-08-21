import type { NicheContent } from './types';
import { eletricista } from './eletricista';
import { fotografo } from './fotografo';
import { arCondicionado } from './ar-condicionado';
import { decoracaoDeCasamento } from './decoracao-de-casamento';
import { prestadorDeServicos } from './prestador-de-servicos';

export const NICHE_BASE_PATH = '/modelo-de-orcamento';

export const NICHES: NicheContent[] = [
  prestadorDeServicos,
  eletricista,
  fotografo,
  arCondicionado,
  decoracaoDeCasamento,
];

export function getNiche(slug: string | undefined): NicheContent | undefined {
  if (!slug) return undefined;
  return NICHES.find((n) => n.slug === slug);
}

export function nichePath(slug: string): string {
  return `${NICHE_BASE_PATH}/${slug}`;
}

export type { NicheContent } from './types';
