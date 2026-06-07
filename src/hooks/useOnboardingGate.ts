import { useAuth } from '@/contexts/AuthContext';

export function useOnboardingGate() {
  const { user, loading, onboardingComplete } = useAuth();
  const checking = loading;
  const needsOnboarding = !!user && !loading && !onboardingComplete;

  return { needsOnboarding, checking };
}
