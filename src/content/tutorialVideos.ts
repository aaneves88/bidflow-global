// Single source of the video library; reusable later for end users.
type Pointer = { url: string; size: number };

const pointers = import.meta.glob<{ default: Pointer }>('../assets/videos/*.mp4.asset.json', { eager: true });

function find(file: string): Pointer | null {
  const hit = Object.entries(pointers).find(([path]) => path.endsWith(`/${file}.asset.json`));
  return hit ? hit[1].default : null;
}

export const VIDEO_CATEGORIES = ['tutorials', 'education', 'partners'] as const;
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export const TUTORIAL_VIDEOS = ([
  { key: 'createClient', file: 'orca-tutorial-criar-cliente.mp4', category: 'tutorials' },
  { key: 'createProposal', file: 'orca-tutorial-criar-proposta.mp4', category: 'tutorials' },
  { key: 'manageProposal', file: 'orca-tutorial-gerenciar-proposta.mp4', category: 'tutorials' },
  { key: 'approachClient', file: 'orca-edu-abordar-cliente.mp4', category: 'education' },
  { key: 'followUp', file: 'orca-edu-enviar-cobrar-proposta.mp4', category: 'education' },
  { key: 'pricing', file: 'orca-edu-precificacao.mp4', category: 'education' },
  { key: 'mei', file: 'orca-edu-dicas-mei.mp4', category: 'education' },
  { key: 'simples', file: 'orca-edu-dicas-simples.mp4', category: 'education' },
  { key: 'partner', file: 'orca-seja-parceiro.mp4', category: 'partners' },
] as { key: string; file: string; category: VideoCategory }[]).map((v) => ({ ...v, asset: find(v.file) }));
