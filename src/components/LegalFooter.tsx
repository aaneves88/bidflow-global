import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { SupportDialog } from '@/components/SupportDialog';

export function LegalFooter({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { t } = useTranslation('legal');
  const { t: tSupport } = useTranslation('support');
  const { user } = useAuth();
  const baseClass = variant === 'compact' ? 'text-xs' : 'text-sm';
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 ${baseClass} text-muted-foreground`}>
      <Link to="/legal/terms" className="hover:text-foreground">{t('terms.title')}</Link>
      <span className="opacity-30">·</span>
      <Link to="/legal/privacy" className="hover:text-foreground">{t('privacy.title')}</Link>
      <span className="opacity-30">·</span>
      <Link to="/legal/cookies" className="hover:text-foreground">{t('cookies.title')}</Link>
      {user && (
        <>
          <span className="opacity-30">·</span>
          <SupportDialog
            trigger={
              <button type="button" className="hover:text-foreground underline-offset-2 hover:underline">
                {tSupport('trigger')}
              </button>
            }
          />
        </>
      )}
    </div>
  );
}

