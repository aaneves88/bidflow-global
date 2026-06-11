import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { t } = useTranslation('common');
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 text-xs font-medium">
      <WifiOff className="h-3.5 w-3.5" />
      <span>{t('offline.banner')}</span>
    </div>
  );
}
