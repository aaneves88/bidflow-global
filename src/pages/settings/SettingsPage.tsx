import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useBranding, useUpdateBranding, ORCA_BRANDING } from '@/hooks/useBranding';
import { useCanCustomBrand } from '@/hooks/usePlanLimits';
import { LogoUpload } from '@/components/LogoUpload';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { ExternalLink, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function GeneralTab() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { isAdmin } = useAuth();
  const { getSetting, upsert, isLoading: settingsLoading } = useAppSettings('general');
  const branding = useBranding();
  const updateBranding = useUpdateBranding();
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [language, setLanguage] = useState(i18n.language);
  const [publicAppUrl, setPublicAppUrl] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!settingsLoading && !branding.isLoading && !hydrated) {
      setCompanyName(branding.companyName || '');
      setCurrency((getSetting('default_currency') as string) || 'BRL');
      setLanguage((getSetting('language') as string) || i18n.language);
      setPublicAppUrl((getSetting('public_app_url') as string) || '');
      setHydrated(true);
    }
  }, [settingsLoading, branding.isLoading, branding.companyName, hydrated, getSetting, i18n.language]);

  const save = async () => {
    try {
      await updateBranding.mutateAsync({ company_name: companyName });
      // Currency / language / public app url stay global (Orca-level config for admin).
      if (isAdmin) {
        await upsert.mutateAsync({ key: 'default_currency', value: currency, category: 'general' });
        await upsert.mutateAsync({ key: 'language', value: language, category: 'general' });
        await upsert.mutateAsync({ key: 'public_app_url', value: publicAppUrl.replace(/\/+$/, ''), category: 'general' });
      }
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
          <p className="text-xs text-muted-foreground mt-1">{t('general.companyNameHelp')}</p>
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
        {isAdmin && (
          <div>
            <Label>{t('general.publicAppUrl')}</Label>
            <Input
              value={publicAppUrl}
              onChange={(e) => setPublicAppUrl(e.target.value)}
              placeholder="https://suamarca.com"
            />
            <p className="text-xs text-muted-foreground mt-1">{t('general.publicAppUrlHelp')}</p>
          </div>
        )}
        <Button onClick={save} disabled={updateBranding.isPending || upsert.isPending}>{t('common:actions.save')}</Button>
      </CardContent>
    </Card>
  );
}

function ColorField({ label, help, value, onChange, disabled }: { label: string; help?: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-12 rounded cursor-pointer border shrink-0 disabled:opacity-50"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 min-w-0 font-mono text-sm"
        />
      </div>
      {help && <p className="text-xs text-muted-foreground mt-1">{help}</p>}
    </div>
  );
}

function BrandingTab() {
  const { t } = useTranslation(['settings', 'common']);
  const branding = useBranding();
  const updateBranding = useUpdateBranding();
  const canBrand = useCanCustomBrand();
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1F2937');
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!branding.isLoading && !hydrated) {
      setLogoUrl(branding.logoUrl);
      setPrimaryColor(branding.primaryColor);
      setSecondaryColor(branding.secondaryColor);
      setAccentColor(branding.accentColor);
      setHydrated(true);
    }
  }, [branding, hydrated]);

  const save = async () => {
    try {
      await updateBranding.mutateAsync({
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
      });
      toast({ title: t('messages.saved') });
    } catch (e: any) {
      toast({ title: t('messages.error'), description: e?.message, variant: 'destructive' });
    }
  };

  // Preview uses Orca defaults when user is on free, to match what clients will actually see
  const previewLogo = canBrand ? logoUrl : '';
  const previewPrimary = canBrand ? primaryColor : ORCA_BRANDING.primaryColor;
  const previewSecondary = canBrand ? secondaryColor : ORCA_BRANDING.secondaryColor;
  const previewAccent = canBrand ? accentColor : ORCA_BRANDING.accentColor;

  return (
    <div className="space-y-4">
      {!canBrand && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            {t('branding.freeLocked')}{' '}
            <Link to="/pricing" className="font-medium underline">
              {t('branding.freeLockedCta')}
            </Link>
          </AlertDescription>
        </Alert>
      )}
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
            <ColorField label={t('branding.primaryColor')} help={t('branding.primaryHelp')} value={primaryColor} onChange={setPrimaryColor} disabled={!canBrand} />
            <ColorField label={t('branding.secondaryColor')} help={t('branding.secondaryHelp')} value={secondaryColor} onChange={setSecondaryColor} disabled={!canBrand} />
            <ColorField label={t('branding.accentColor')} help={t('branding.accentHelp')} value={accentColor} onChange={setAccentColor} disabled={!canBrand} />
            <Button onClick={save} disabled={updateBranding.isPending || !canBrand}>{t('common:actions.save')}</Button>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-base">{t('branding.preview')}</CardTitle>
            {!canBrand && (
              <p className="text-xs text-muted-foreground">{t('branding.previewFreeNote')}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border bg-background">
              <div className="h-2" style={{ backgroundColor: previewPrimary }} />
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {previewLogo ? (
                    <img src={previewLogo} alt="" className="h-8 w-auto object-contain" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted" />
                  )}
                  <span className="font-semibold text-sm" style={{ color: previewSecondary }}>
                    Proposal #0001
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Website redesign — Acme Co.</p>
                <div className="flex items-end justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-xl font-bold" style={{ color: previewAccent }}>$ 12,800</span>
                </div>
                <button
                  className="w-full rounded-md py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: previewPrimary }}
                  type="button"
                >
                  Accept proposal
                </button>
                {!canBrand && (
                  <p className="text-[10px] text-center text-muted-foreground pt-1">
                    Powered by Orca
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation('settings');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
      <Link
        to="/admin/integrations"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        {t('integrationsCta')}
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2 md:inline-flex md:w-auto">
          <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
          <TabsTrigger value="branding">{t('tabs.branding')}</TabsTrigger>
        </TabsList>
        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="branding"><BrandingTab /></TabsContent>
      </Tabs>
    </div>
  );
}
