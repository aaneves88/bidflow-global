import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface PixPaymentProps {
  payload: string;
  merchantName: string;
  amountLabel: string;
  accentColor?: string;
}

export function PixPayment({ payload, merchantName, amountLabel, accentColor }: PixPaymentProps) {
  const { t } = useTranslation('public');
  const [qr, setQr] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, { width: 512, margin: 1 })
      .then((url) => { if (active) setQr(url); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [payload]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast({ title: t('pix.copied') });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: t('pix.copyError'), variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-4 w-4" style={accentColor ? { color: accentColor } : undefined} />
          {t('pix.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          {qr && (
            <img
              src={qr}
              alt={t('pix.qrAlt')}
              className="h-44 w-44 rounded-lg border bg-background p-2"
            />
          )}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">{t('pix.instructions')}</p>
            <p className="text-sm">
              <span className="text-muted-foreground">{t('pix.receiver')}: </span>
              <span className="font-medium">{merchantName}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">{t('pix.amount')}: </span>
              <span className="font-medium tabular-nums">{amountLabel}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('pix.copyPaste')}
          </p>
          <div className="flex gap-2">
            <code className="flex-1 min-w-0 truncate rounded-md border bg-muted/50 px-3 py-2 text-xs">
              {payload}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">{t('pix.disclaimer')}</p>
      </CardContent>
    </Card>
  );
}
