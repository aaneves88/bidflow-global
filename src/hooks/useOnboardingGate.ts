import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useOnboardingGate() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setChecking(false);
      setNeedsOnboarding(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profile?.onboarding_complete) {
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
