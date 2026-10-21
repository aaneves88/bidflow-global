import { describe, expect, it } from 'vitest';
import { getHelpVideos, videoSource } from './tutorialVideos';

describe('Customer help video selection', () => {
  it('includes the eight existing tutorial and education videos', () => {
    expect(getHelpVideos().map((video) => video.key)).toEqual([
      'createClient', 'createProposal', 'manageProposal', 'approachClient',
      'followUp', 'pricing', 'mei', 'simples',
    ]);
  });

  it('excludes partner videos', () => {
    expect(getHelpVideos().some((video) => video.category === 'partners')).toBe(false);
  });

  it('excludes advertisements', () => {
    expect(getHelpVideos().some((video) => video.category === 'ads')).toBe(false);
  });

  it('resolves a playable source for all eight videos', () => {
    expect(getHelpVideos().every((video) => Boolean(videoSource(video)))).toBe(true);
  });
});