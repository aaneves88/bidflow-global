import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

function GeneralTab() {
  const { getSetting, upsert, isLoading } = useAppSettings('general');
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (!isLoading) {
      setCompanyName((getSetting('company_name') as string) || '');
      setCurrency((getSetting('default_currency') as string) || 'USD');
    }
  }, [isLoading, getSetting]);

  const save = async () => {
    try {
      await upsert.mutateAsync({ key: 'company_name', value: companyName, category: 'general' });
      await upsert.mutateAsync({ key: 'default_currency', value: currency, category: 'general' });
      toast({ title: 'Settings saved' });
    } catch {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Company Name</Label>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company" />
        </div>
        <div>
          <Label>Default Currency</Label>
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
        </div>
        <Button onClick={save} disabled={upsert.isPending}>Save</Button>
      </CardContent>
    </Card>
  );
}

function IntegrationsTab() {
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
      toast({ title: 'Integration settings saved' });
    } catch {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
          <Label>Stripe Payments</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
          <Label>WhatsApp</Label>
        </div>
        {whatsappEnabled && (
          <div>
            <Label>WhatsApp Phone Number</Label>
            <Input value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="+1234567890" />
          </div>
        )}
        <Button onClick={save} disabled={upsert.isPending}>Save</Button>
      </CardContent>
    </Card>
  );
}

function BrandingTab() {
  const { getSetting, upsert, isLoading } = useAppSettings('branding');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');

  useEffect(() => {
    if (!isLoading) {
      setLogoUrl((getSetting('logo_url') as string) || '');
      setPrimaryColor((getSetting('primary_color') as string) || '#3B82F6');
    }
  }, [isLoading, getSetting]);

  const save = async () => {
    try {
      await upsert.mutateAsync({ key: 'logo_url', value: logoUrl, category: 'branding' });
      await upsert.mutateAsync({ key: 'primary_color', value: primaryColor, category: 'branding' });
      toast({ title: 'Branding settings saved' });
    } catch {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Logo URL</Label>
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label>Primary Color</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer" />
            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
          </div>
        </div>
        <Button onClick={save} disabled={upsert.isPending}>Save</Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>
        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
        <TabsContent value="branding"><BrandingTab /></TabsContent>
      </Tabs>
    </div>
  );
}
