import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns { needsOnboarding, checking }.
 * A user "needs onboarding" if:
 *  - they have no localStorage "onboarded" flag, AND
 *  - they have zero clients AND zero proposals.
 * Existing users with data get auto-flagged so they are never sent back.
 */
export function useOnboardingGate() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(() => {
    const hasAnyOnboardingFlag = Object.keys(localStorage).some((key) => key.startsWith('cf_onboarded_'));
    return !hasAnyOnboardingFlag;
  });
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setChecking(false);
      setNeedsOnboarding(false);
      return;
    }

    const flagKey = `cf_onboarded_${user.id}`;
    if (localStorage.getItem(flagKey)) {
      setNeedsOnboarding(false);
      setChecking(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const [{ count: clientCount }, { count: proposalCount }] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      if (cancelled) return;
      const hasData = (clientCount ?? 0) > 0 || (proposalCount ?? 0) > 0;
      if (hasData) {
        localStorage.setItem(flagKey, '1');
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return { needsOnboarding, checking };
}
