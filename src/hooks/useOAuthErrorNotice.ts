import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { clearOAuthError, isUserCancelled, readOAuthError } from '@/lib/oauthError';

/**
 * Mostra um aviso quando o retorno do login social traz erro na URL.
 * Sem isso, a tela apenas "carrega e volta" sem explicação nenhuma.
 */
export function useOAuthErrorNotice() {
  const { t } = useTranslation('auth');
  const { toast } = useToast();

  useEffect(() => {
    const info = readOAuthError();
    if (!info) return;
    clearOAuthError();

    const description = info.identityConflict
      ? t('oauth.identityConflict')
      : isUserCancelled(info)
        ? t('oauth.cancelled')
        : info.description || t('oauth.generic');

    toast({
      title: t('oauth.errorTitle'),
      description,
      variant: 'destructive',
    });
  }, [t, toast]);
}
