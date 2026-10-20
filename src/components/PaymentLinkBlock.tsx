import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink } from 'lucide-react';
import { isValidPaymentLink } from '@/lib/paymentLink';

export function PaymentLinkBlock({ url, label, accentColor }: { url?: string | null; label?: string | null; accentColor?: string }) {
  const { t } = useTranslation('public');
  if (!url || !isValidPaymentLink(url)) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" style={{ color: accentColor }} /> {t('paymentLink.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{label || t('paymentLink.defaultLabel')}</p>
        <Button asChild size="lg" style={accentColor ? { backgroundColor: accentColor, color: '#fff' } : undefined}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t('paymentLink.button')} <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">{t('paymentLink.disclaimer')}</p>
      </CardContent>
    </Card>
  );
}
