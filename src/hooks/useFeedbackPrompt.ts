import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const FEEDBACK_THRESHOLDS = [3, 10, 30] as const;

/** First threshold the account has passed that was never shown, or null. */
export function pickFeedbackThreshold(ageDays: number, shown: number[]): number | null {
  for (const th of FEEDBACK_THRESHOLDS) {
    if (ageDays >= th && !shown.includes(th)) return th;
  }
  return null;
}

/** Runs once per page load (mounted only inside the logged-in AppLayout). */
export function useFeedbackPrompt() {
  const { user } = useAuth();
  const ran = useRef(false);
  const [threshold, setThreshold] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const [{ data: profile }, { count }, { data: shownRows }] = await Promise.all([
          supabase.from('profiles').select('created_at').eq('id', user.id).maybeSingle(),
          supabase.from('support_tickets').select('id', { count: 'exact', head: true })
            .eq('user_id', user.id).eq('category', 'feedback'),
          supabase.from('feedback_prompts_shown').select('threshold_days').eq('user_id', user.id),
        ]);
        if (!profile?.created_at || (count ?? 0) > 0) return;
        const ageDays = (Date.now() - new Date(profile.created_at).getTime()) / 86_400_000;
        const th = pickFeedbackThreshold(ageDays, (shownRows ?? []).map((r) => r.threshold_days));
        if (th === null) return;
        const { error } = await supabase.from('feedback_prompts_shown')
          .insert({ user_id: user.id, threshold_days: th });
        if (error) return; // e.g. another tab already recorded it
        setThreshold(th);
        setOpen(true);
      } catch (e) {
        console.error('feedback prompt check failed', e);
      }
    })();
  }, [user]);

  return { threshold, open, setOpen };
}
