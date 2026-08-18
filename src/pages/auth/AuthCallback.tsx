import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearOAuthError, isUserCancelled, readOAuthError } from '@/lib/oauthError';
import { consumeOAuthTokens, readOAuthTokens, takeOAuthNext } from '@/lib/oauthCallback';

/**
 * Rota pública de retorno do login social (redirect de página inteira).
 * Lê os tokens da URL, grava a sessão e só então navega para o destino.
 */
export default function AuthCallback() {
  const { t } = useTranslation('auth');
  const { toast } = useToast();
  const navigate = useNavigate();
  const ran = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const fail = (description: string) => {
      toast({ title: t('oauth.errorTitle'), description, variant: 'destructive' });
      setFailed(true);
      navigate('/app', { replace: true });
    };

    const errorInfo = readOAuthError();
    if (errorInfo) {
      clearOAuthError();
      fail(
        errorInfo.identityConflict
          ? t('oauth.identityConflict')
          : isUserCancelled(errorInfo)
            ? t('oauth.cancelled')
            : errorInfo.description || t('oauth.generic'),
      );
      return;
    }

    if (!readOAuthTokens()) {
      fail(t('oauth.generic'));
      return;
    }

    consumeOAuthTokens().then((ok) => {
      if (!ok) {
        fail(t('oauth.generic'));
        return;
      }
      navigate(takeOAuthNext(), { replace: true });
    });
  }, [navigate, t, toast]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 bg-background px-6">
      {!failed && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
      <p className="text-sm text-muted-foreground">{t('oauth.completing')}</p>
    </div>
  );
}
