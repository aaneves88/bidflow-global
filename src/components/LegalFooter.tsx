import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function LegalFooter({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { t } = useTranslation('legal');
  const baseClass = variant === 'compact' ? 'text-xs' : 'text-sm';
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 ${baseClass} text-muted-foreground`}>
      <Link to="/legal/terms" className="hover:text-foreground">{t('terms.title')}</Link>
      <span className="opacity-30">·</span>
      <Link to="/legal/privacy" className="hover:text-foreground">{t('privacy.title')}</Link>
      <span className="opacity-30">·</span>
      <Link to="/legal/cookies" className="hover:text-foreground">{t('cookies.title')}</Link>
    </div>
  );
}
