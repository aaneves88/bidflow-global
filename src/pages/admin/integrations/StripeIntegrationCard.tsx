import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAppSettings } from '@/hooks/useAppSettings';
import { usePlans } from '@/hooks/usePlans';
import { supabase } from '@/integrations/supabase/client';

const CATEGORY = 'integrations';

type StripeMode = 'test' | 'live';

export default function StripeIntegrationCard() {
  const { t } = useTranslation('integrations');
  const { getSetting, upsert, isLoading } = useAppSettings(CATEGORY);
  const { plans } = usePlans(true);

  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<StripeMode>('test');
  const [publishableKey, setPublishableKey] = useState('');
  const [successUrl, setSuccessUrl] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    setEnabled(getSetting('stripe_enabled') === true);
    setMode((getSetting('stripe_mode') as StripeMode) || 'test');
    setPublishableKey((getSetting('stripe_publishable_key') as string) || '');
    setSuccessUrl((getSetting('stripe_success_url') as string) || `${window.location.origin}/dashboard?checkout=success`);
    setCancelUrl((getSetting('stripe_cancel_url') as string) || `${window.location.origin}/pricing?checkout=cancel`);
    setMapping((getSetting('stripe_product_mapping') as Record<string, string>) || {});
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const projectRef = useMemo(() => {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const m = url.match(/https?:\/\/([^.]+)\./);
    return m?.[1] || '';
  }, []);

  const webhookUrl = projectRef
    ? `https://${projectRef}.supabase.co/functions/v1/stripe-webhook`
    : '';

  const paidPlans = plans.filter((p: any) => Number(p.price) > 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        upsert.mutateAsync({ key: 'stripe_enabled', value: enabled, category: CATEGORY }),
        upsert.mutateAsync({ key: 'stripe_mode', value: mode, category: CATEGORY }),
        upsert.mutateAsync({ key: 'stripe_publishable_key', value: publishableKey, category: CATEGORY }),
        upsert.mutateAsync({ key: 'stripe_success_url', value: successUrl, category: CATEGORY }),
        upsert.mutateAsync({ key: 'stripe_cancel_url', value: cancelUrl, category: CATEGORY }),
        upsert.mutateAsync({ key: 'stripe_product_mapping', value: mapping, category: CATEGORY }),
      ]);
      toast({ title: t('actions.saved') });
    } catch (e: any) {
      toast({ title: t('actions.saveError'), description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const firstPaid = paidPlans[0];
    if (!firstPaid || !mapping[firstPaid.id] || !publishableKey) {
      toast({ title: t('stripe.messages.missingConfig'), variant: 'destructive' });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { plan_id: firstPaid.id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('actions.copied') });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              {t('stripe.name')}
              <Badge variant={enabled ? 'default' : 'outline'}>
                {enabled ? t('status.active') : t('status.inactive')}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{t('stripe.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="stripe-enabled" className="text-sm">{t('stripe.enable')}</Label>
            <Switch id="stripe-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t('stripe.secretWarning')}</AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('stripe.mode')}</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as StripeMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="test">{t('stripe.modeTest')}</SelectItem>
                <SelectItem value="live">{t('stripe.modeLive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('stripe.publishableKey')}</Label>
            <Input
              placeholder="pk_test_..."
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t('stripe.publishableKeyHint')}</p>
          </div>
          <div className="space-y-2">
            <Label>{t('stripe.successUrl')}</Label>
            <Input value={successUrl} onChange={(e) => setSuccessUrl(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t('stripe.successUrlHint')}</p>
          </div>
          <div className="space-y-2">
            <Label>{t('stripe.cancelUrl')}</Label>
            <Input value={cancelUrl} onChange={(e) => setCancelUrl(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t('stripe.cancelUrlHint')}</p>
          </div>
        </div>

        {webhookUrl && (
          <div className="space-y-2">
            <Label>{t('stripe.webhookUrl')}</Label>
            <div className="flex gap-2">
              <Input readOnly value={webhookUrl} className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copy(webhookUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Label className="text-base">{t('stripe.productMapping')}</Label>
            <p className="text-xs text-muted-foreground">{t('stripe.productMappingHint')}</p>
          </div>
          {paidPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <div className="space-y-2">
              {paidPlans.map((p: any) => (
                <div key={p.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <div className="text-sm font-medium">{p.name}</div>
                  <Input
                    placeholder="price_..."
                    value={mapping[p.id] || ''}
                    onChange={(e) => setMapping({ ...mapping, [p.id]: e.target.value })}
                    className="md:col-span-2 font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="guide">
            <AccordionTrigger>{t('stripe.guide.title')}</AccordionTrigger>
            <AccordionContent>
              <ol className="space-y-4 text-sm">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <li key={i}>
                    <div className="font-medium">{t(`stripe.guide.step${i}Title`)}</div>
                    <div className="text-muted-foreground mt-1">{t(`stripe.guide.step${i}`)}</div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer">
                    Stripe API keys <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://dashboard.stripe.com/products" target="_blank" rel="noreferrer">
                    Stripe Products <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noreferrer">
                    Stripe Webhooks <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button onClick={handleSave} disabled={saving}>{t('actions.save')}</Button>
          <Button variant="outline" onClick={handleTest} disabled={!enabled}>
            {t('actions.test')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
