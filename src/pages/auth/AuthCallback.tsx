import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearOAuthError, isUserCancelled, readOAuthError } from '@/lib/oauthError';
import { consumeOAuthTokens, readOAuthTokens, takeOAuthNext } from '@/lib/oauthCallback';
import { persistSignupAttribution } from '@/lib/attributionSync';
import { supabase } from '@/integrations/supabase/client';

const NEW_ACCOUNT_WINDOW_MS = 2 * 60 * 1000;

/** Conta criada há menos de 2 min = cadastro novo pelo Google → boas-vindas. */
async function sendWelcomeIfNewAccount() {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user?.email) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at, full_name')
      .eq('id', user.id)
      .maybeSingle();
    const createdAt = profile?.created_at ?? user.created_at;
    if (!createdAt || Date.now() - new Date(createdAt).getTime() > NEW_ACCOUNT_WINDOW_MS) return;
    const fullName = (profile?.full_name ?? '').trim();
    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'welcome',
        recipientEmail: user.email,
        idempotencyKey: `welcome-${user.email.toLowerCase()}`,
        templateData: {
          firstName: fullName.split(' ')[0] || undefined,
          appUrl: 'https://orca-mento.app',
        },
      },
    });
    if (error) console.warn('welcome email failed', error);
  } catch (e) {
    console.warn('welcome email failed', e);
  }
}

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

    consumeOAuthTokens().then(async (ok) => {
      if (!ok) {
        fail(t('oauth.generic'));
        return;
      }
      void persistSignupAttribution();
      await sendWelcomeIfNewAccount();
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
