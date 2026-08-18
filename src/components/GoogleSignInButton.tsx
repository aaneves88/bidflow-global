import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { lovable } from '@/integrations/lovable';
import { OAUTH_CALLBACK_PATH, rememberOAuthNext } from '@/lib/oauthCallback';

type Props = {
  /** Para onde ir quando a sessão já vier resolvida (sem redirect de página inteira). */
  onSuccess?: () => void;
  /** Destino same-origin depois do redirect de página inteira. */
  next?: string | null;
  disabled?: boolean;
  className?: string;
};

const CONFLICT_HINTS = ['identity_already_exists', 'already registered', 'already exists', 'manual linking'];

export function GoogleSignInButton({ onSuccess, next, disabled, className }: Props) {
  const { t } = useTranslation('auth');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    // O destino fica no sessionStorage; a URL do provedor recebe só a rota
    // pública de callback, que grava a sessão antes de navegar.
    rememberOAuthNext(next ?? null);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}${OAUTH_CALLBACK_PATH}`,
    });

    if (result.error) {
      const message = String(result.error?.message ?? '');
      const conflict = CONFLICT_HINTS.some((h) => message.toLowerCase().includes(h));
      toast({
        title: t('oauth.errorTitle'),
        description: conflict ? t('oauth.identityConflict') : message || t('oauth.generic'),
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (result.redirected) return;

    onSuccess?.();
    setLoading(false);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={className ?? 'w-full h-12'}
      onClick={handleClick}
      disabled={loading || disabled}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <GoogleIcon />
          <span className="ml-2">{t('entry.google')}</span>
        </>
      )}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
