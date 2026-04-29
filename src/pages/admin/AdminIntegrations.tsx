import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import StripeIntegrationCard from './integrations/StripeIntegrationCard';

const SOON_KEYS = ['whatsapp', 'resend', 'pix', 'calendar', 'sheets', 'zapier'] as const;

export default function AdminIntegrations() {
  const { t } = useTranslation('integrations');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground max-w-3xl">{t('subtitle')}</p>
      </div>

      <StripeIntegrationCard />

      <div>
        <h2 className="text-xl font-semibold mb-3">{t('status.comingSoon')}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SOON_KEYS.map((key) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{t(`soon.${key}.name`)}</CardTitle>
                  <Badge variant="outline">{t('status.comingSoon')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{t(`soon.${key}.description`)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast({ title: t('actions.interested') })}
                >
                  {t('actions.suggest')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
