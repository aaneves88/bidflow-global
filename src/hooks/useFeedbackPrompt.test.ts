import { describe, it, expect, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
import { pickFeedbackThreshold } from './useFeedbackPrompt';

describe('pickFeedbackThreshold', () => {
  it('nada antes de 3 dias', () => expect(pickFeedbackThreshold(2.9, [])).toBeNull());
  it('3 dias na primeira vez', () => expect(pickFeedbackThreshold(12, [])).toBe(3));
  it('pula marcos já mostrados', () => expect(pickFeedbackThreshold(12, [3])).toBe(10));
  it('nunca repete marco', () => expect(pickFeedbackThreshold(40, [3, 10, 30])).toBeNull());
});
