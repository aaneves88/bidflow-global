import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';

export function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useTranslation('common');
  const location = useLocation();
  const { needsOnboarding, checking } = useOnboardingGate();
  const hasOnboardingFlag = Object.keys(localStorage).some((key) => key.startsWith('cf_onboarded_'));

  if (loading || (user && checking && !hasOnboardingFlag)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('actions.loading')}</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}
