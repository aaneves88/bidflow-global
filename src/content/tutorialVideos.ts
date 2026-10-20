// Single source of the video library; reusable later for end users.
type Pointer = { url: string; size: number };

const pointers = import.meta.glob<{ default: Pointer }>('../assets/videos/*.mp4.asset.json', { eager: true });

function find(file: string): Pointer | null {
  const hit = Object.entries(pointers).find(([path]) => path.endsWith(`/${file}.asset.json`));
  return hit ? hit[1].default : null;
}

export const VIDEO_CATEGORIES = ['tutorials', 'education', 'partners', 'ads'] as const;
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export interface LibraryVideo {
  key: string;
  file: string;
  category: VideoCategory;
  asset: Pointer | null;
  /** Static fallback under public/ when the asset pointer is not registered. */
  publicPath?: string;
}

const RAW_VIDEOS = ([
  { key: 'createClient', file: 'orca-tutorial-criar-cliente.mp4', category: 'tutorials' },
  { key: 'createProposal', file: 'orca-tutorial-criar-proposta.mp4', category: 'tutorials' },
  { key: 'manageProposal', file: 'orca-tutorial-gerenciar-proposta.mp4', category: 'tutorials' },
  { key: 'approachClient', file: 'orca-edu-abordar-cliente.mp4', category: 'education' },
  { key: 'followUp', file: 'orca-edu-enviar-cobrar-proposta.mp4', category: 'education' },
  { key: 'pricing', file: 'orca-edu-precificacao.mp4', category: 'education' },
  { key: 'mei', file: 'orca-edu-dicas-mei.mp4', category: 'education' },
  { key: 'simples', file: 'orca-edu-dicas-simples.mp4', category: 'education' },
  { key: 'partner', file: 'orca-seja-parceiro.mp4', category: 'partners' },
  { key: 'adCreateProposals', file: 'criar_propostas_vertical.mp4', category: 'ads', publicPath: '/ads/videos/criar_propostas_vertical.mp4' },
  { key: 'adTrackProposals', file: 'acompanhar_clientes_vertical.mp4', category: 'ads', publicPath: '/ads/videos/acompanhar_clientes_vertical.mp4' },
  { key: 'adBudgets', file: 'organizar_orcamentos_vertical.mp4', category: 'ads', publicPath: '/ads/videos/organizar_orcamentos_vertical.mp4' },
] as { key: string; file: string; category: VideoCategory; publicPath?: string }[]).map((v) => ({ ...v, asset: find(v.file) }));

export const TUTORIAL_VIDEOS: LibraryVideo[] = RAW_VIDEOS;

export function videoSource(v: LibraryVideo): string | null {
  return v.asset?.url ?? v.publicPath ?? null;
}

export type CreativeFormat = 'square' | 'portrait' | 'vertical';

export interface AdCreative {
  key: string;
  src: string;
  file: string;
  format: CreativeFormat;
}

// Final corrected versions only: where a _v2 file exists, it supersedes the original.
export const AD_CREATIVES: AdCreative[] = [
  { key: 'creativeCreate', src: '/ads/creatives/criar_propostas_square.jpg', file: 'criar_propostas_square.jpg', format: 'square' },
  { key: 'creativeCreate', src: '/ads/creatives/criar_propostas_portrait.jpg', file: 'criar_propostas_portrait.jpg', format: 'portrait' },
  { key: 'creativeCreate', src: '/ads/creatives/criar_propostas_vertical.jpg', file: 'criar_propostas_vertical.jpg', format: 'vertical' },
  { key: 'creativeTrack', src: '/ads/creatives/acompanhar_propostas_square_v2.jpg', file: 'acompanhar_propostas_square_v2.jpg', format: 'square' },
  { key: 'creativeTrack', src: '/ads/creatives/acompanhar_propostas_portrait_v2.jpg', file: 'acompanhar_propostas_portrait_v2.jpg', format: 'portrait' },
  { key: 'creativeTrack', src: '/ads/creatives/acompanhar_propostas_vertical_v2.jpg', file: 'acompanhar_propostas_vertical_v2.jpg', format: 'vertical' },
  { key: 'creativeOrganize', src: '/ads/creatives/organizar_orcamentos_square.jpg', file: 'organizar_orcamentos_square.jpg', format: 'square' },
  { key: 'creativeOrganize', src: '/ads/creatives/organizar_orcamentos_portrait.jpg', file: 'organizar_orcamentos_portrait.jpg', format: 'portrait' },
  { key: 'creativeOrganize', src: '/ads/creatives/organizar_orcamentos_vertical_v2.jpg', file: 'organizar_orcamentos_vertical_v2.jpg', format: 'vertical' },
  { key: 'creativeNext', src: '/ads/creatives/proximo_orcamento_square.jpg', file: 'proximo_orcamento_square.jpg', format: 'square' },
  { key: 'creativeNext', src: '/ads/creatives/proximo_orcamento_portrait_v2.jpg', file: 'proximo_orcamento_portrait_v2.jpg', format: 'portrait' },
  { key: 'creativeNext', src: '/ads/creatives/proximo_orcamento_vertical_v2.jpg', file: 'proximo_orcamento_vertical_v2.jpg', format: 'vertical' },
];
