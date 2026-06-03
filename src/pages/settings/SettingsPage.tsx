import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSettings } from '@/hooks/useAppSettings';
import { LogoUpload } from '@/components/LogoUpload';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';

function GeneralTab() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { getSetting, upsert, isLoading } = useAppSettings('general');
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    if (!isLoading) {
      setCompanyName((getSetting('company_name') as string) || '');
      setCurrency((getSetting('default_currency') as string) || 'BRL');
      const lang = (getSetting('language') as string) || i18n.language;
      setLanguage(lang);
    }
  }, [isLoading, getSetting, i18n.language]);

  const save = async () => {
    try {
      await upsert.mutateAsync({ key: 'company_name', value: companyName, category: 'general' });
      await upsert.mutateAsync({ key: 'default_currency', value: currency, category: 'general' });
      await upsert.mutateAsync({ key: 'language', value: language, category: 'general' });
      i18n.changeLanguage(language);
      toast({ title: t('messages.saved') });
    } catch (e: any) {
      toast({ title: t('messages.error'), description: e?.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t('general.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{t('general.companyName')}</Label>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t('general.companyPlaceholder')} />
        </div>
        <div>
          <Label>{t('general.defaultCurrency')}</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['BRL', 'USD', 'EUR', 'GBP'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t('general.language')}</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={save} disabled={upsert.isPending}>{t('common:actions.save')}</Button>
      </CardContent>
    </Card>
  );
}

function IntegrationsTab() {
  const { t } = useTranslation(['settings', 'common']);
  const { getSetting, upsert, isLoading } = useAppSettings('integrations');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setStripeEnabled(getSetting('stripe_enabled') === true);
      setWhatsappEnabled(getSetting('whatsapp_enabled') === true);
      setWhatsappPhone((getSetting('whatsapp_phone') as string) || '');
    }
  }, [isLoading, getSetting]);

  const save = async () => {
    try {
      await upsert.mutateAsync({ key: 'stripe_enabled', value: stripeEnabled, category: 'integrations' });
      await upsert.mutateAsync({ key: 'whatsapp_enabled', value: whatsappEnabled, category: 'integrations' });
      await upsert.mutateAsync({ key: 'whatsapp_phone', value: whatsappPhone, category: 'integrations' });
      toast({ title: t('messages.saved') });
    } catch (e: any) {
      toast({ title: t('messages.error'), description: e?.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t('integrations.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
            <Label>{t('integrations.stripe')}</Label>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-12">{t('integrations.stripeDescription')}</p>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
            <Label>{t('integrations.whatsapp')}</Label>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-12">{t('integrations.whatsappDescription')}</p>
        </div>
        {whatsappEnabled && (
          <div>
            <Label>{t('integrations.whatsappPhone')}</Label>
            <Input value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder={t('integrations.whatsappPlaceholder')} />
          </div>
        )}
        <Button onClick={save} disabled={upsert.isPending}>{t('common:actions.save')}</Button>
      </CardContent>
    </Card>
  );
}

function ColorField({ label, help, value, onChange }: { label: string; help?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded cursor-pointer border"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 font-mono text-sm" />
      </div>
      {help && <p className="text-xs text-muted-foreground mt-1">{help}</p>}
    </div>
  );
}

function BrandingTab() {
  const { t } = useTranslation(['settings', 'common']);
  const { getSetting, upsert, isLoading } = useAppSettings('branding');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1F2937');
  const [accentColor, setAccentColor] = useState('#22C55E');

  useEffect(() => {
    if (!isLoading) {
      setLogoUrl((getSetting('logo_url') as string) || '');
      setPrimaryColor((getSetting('primary_color') as string) || '#3B82F6');
      setSecondaryColor((getSetting('secondary_color') as string) || '#1F2937');
      setAccentColor((getSetting('accent_color') as string) || '#22C55E');
    }
  }, [isLoading, getSetting]);

  const save = async () => {
    try {
      await upsert.mutateAsync({ key: 'logo_url', value: logoUrl, category: 'branding' });
      await upsert.mutateAsync({ key: 'primary_color', value: primaryColor, category: 'branding' });
      await upsert.mutateAsync({ key: 'secondary_color', value: secondaryColor, category: 'branding' });
      await upsert.mutateAsync({ key: 'accent_color', value: accentColor, category: 'branding' });
      toast({ title: t('messages.saved') });
    } catch (e: any) {
      toast({ title: t('messages.error'), description: e?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{t('branding.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('branding.subtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>{t('branding.logo')}</Label>
            <LogoUpload value={logoUrl} onChange={setLogoUrl} />
          </div>
          <ColorField label={t('branding.primaryColor')} help={t('branding.primaryHelp')} value={primaryColor} onChange={setPrimaryColor} />
          <ColorField label={t('branding.secondaryColor')} help={t('branding.secondaryHelp')} value={secondaryColor} onChange={setSecondaryColor} />
          <ColorField label={t('branding.accentColor')} help={t('branding.accentHelp')} value={accentColor} onChange={setAccentColor} />
          <Button onClick={save} disabled={upsert.isPending}>{t('common:actions.save')}</Button>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card className="self-start">
        <CardHeader><CardTitle className="text-base">{t('branding.preview')}</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border bg-background">
            <div className="h-2" style={{ backgroundColor: primaryColor }} />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted" />
                )}
                <span className="font-semibold text-sm" style={{ color: secondaryColor }}>
                  Proposal #0001
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Website redesign — Acme Co.</p>
              <div className="flex items-end justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-xl font-bold" style={{ color: accentColor }}>$ 12,800</span>
              </div>
              <button
                className="w-full rounded-md py-2 text-sm font-medium text-white"
                style={{ backgroundColor: primaryColor }}
                type="button"
              >
                Accept proposal
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation('settings');
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
          <TabsTrigger value="integrations">{t('tabs.integrations')}</TabsTrigger>
          <TabsTrigger value="branding">{t('tabs.branding')}</TabsTrigger>
        </TabsList>
        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
        <TabsContent value="branding"><BrandingTab /></TabsContent>
      </Tabs>
    </div>
  );
}
