import type { SnippetKind } from '@/hooks/useSnippets';

export type SnippetPreset = {
  id: string;
  kind: SnippetKind;
};

/**
 * Blocos-modelo sugeridos para quem ainda não criou nenhum.
 * Título e texto vêm do i18n (namespace `snippets`, chave `presets.<id>`).
 */
export const SNIPPET_PRESETS: SnippetPreset[] = [
  { id: 'payment5050', kind: 'terms' },
  { id: 'paymentUpfront', kind: 'terms' },
  { id: 'deadline', kind: 'terms' },
  { id: 'revisions', kind: 'terms' },
  { id: 'cancellation', kind: 'terms' },
  { id: 'validity', kind: 'notes' },
  { id: 'whatIncludes', kind: 'notes' },
  { id: 'scope', kind: 'description' },
];

export function presetsForKind(kind: SnippetKind) {
  return SNIPPET_PRESETS.filter((p) => p.kind === kind);
}
