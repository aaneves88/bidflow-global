import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, Share, X } from 'lucide-react';
import { useIsNative } from '@/hooks/useIsNative';

const DISMISS_KEY = 'orca_install_prompt_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
  const webkit = /WebKit/.test(ua);
  const otherBrowser = /CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return iOS && webkit && !otherBrowser;
}

export function InstallAppBanner() {
  const { t } = useTranslation('common');
  const isNative = useIsNative();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isNative) return;
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    setDismissed(false);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    if (isIosSafari()) setShowIos(true);

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, [isNative]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  if (dismissed || (!deferred && !showIos)) return null;

  return (
    <div className="border-b bg-primary/5">
      <div className="flex items-start gap-3 px-4 py-2.5">
        <Download className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{t('installApp.title')}</p>
          <p className="text-xs text-muted-foreground">
            {deferred ? (
              t('installApp.subtitle')
            ) : (
              <span className="inline-flex items-center gap-1 flex-wrap">
                {t('installApp.iosHintPrefix')}
                <Share className="h-3 w-3" />
                {t('installApp.iosHintSuffix')}
              </span>
            )}
          </p>
        </div>
        {deferred && (
          <Button size="sm" onClick={install}>
            {t('installApp.cta')}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={dismiss}
          aria-label={t('installApp.dismiss')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
