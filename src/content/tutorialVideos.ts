// Single source of tutorial videos; reusable later for end users.
type Pointer = { url: string; size: number };

const pointers = import.meta.glob<{ default: Pointer }>('../assets/videos/*.mp4.asset.json', { eager: true });

function find(file: string): Pointer | null {
  const hit = Object.entries(pointers).find(([path]) => path.endsWith(`/${file}.asset.json`));
  return hit ? hit[1].default : null;
}

export const TUTORIAL_VIDEOS = [
  { key: 'createClient', file: 'orca-tutorial-criar-cliente.mp4' },
  { key: 'createProposal', file: 'orca-tutorial-criar-proposta.mp4' },
  { key: 'manageProposal', file: 'orca-tutorial-gerenciar-proposta.mp4' },
].map((v) => ({ ...v, asset: find(v.file) }));
