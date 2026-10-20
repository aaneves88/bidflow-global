import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isValidPaymentLink } from '@/lib/paymentLink';

export function PaymentLinkCard() {
  const { t } = useTranslation(['settings', 'common']);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['payment-link', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('payment_link, payment_link_label')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data && !hydrated) {
      setUrl(data.payment_link || '');
      setLabel(data.payment_link_label || '');
      setHydrated(true);
    }
  }, [data, hydrated]);

  const save = useMutation({
    mutationFn: async (patch: { payment_link: string | null; payment_link_label: string | null }) => {
      const { error } = await supabase.from('profiles').update(patch).eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-link'] }),
  });

  const persist = async (u: string, l: string) => {
    try {
      await save.mutateAsync({ payment_link: u || null, payment_link_label: u ? l || null : null });
      toast({ title: u ? t('paymentLink.saved') : t('paymentLink.removed') });
    } catch (e: any) {
      toast({ title: t('common:messages.errorSaving'), description: e?.message, variant: 'destructive' });
    }
  };

  const handleSave = () => {
    const u = url.trim();
    if (u && !isValidPaymentLink(u)) {
      toast({ title: t('paymentLink.invalid'), variant: 'destructive' });
      return;
    }
    persist(u, label.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" /> {t('paymentLink.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('paymentLink.description')}</p>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <div>
              <Label htmlFor="payment_link">{t('paymentLink.url')}</Label>
              <Input id="payment_link" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://mpago.la/..." />
            </div>
            <div>
              <Label htmlFor="payment_link_label">{t('paymentLink.label')}</Label>
              <Input
                id="payment_link_label"
                value={label}
                maxLength={80}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t('paymentLink.labelPlaceholder')}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleSave} disabled={save.isPending}>{t('paymentLink.save')}</Button>
              {!!data?.payment_link && (
                <Button variant="outline" disabled={save.isPending} onClick={() => { setUrl(''); setLabel(''); persist('', ''); }}>
                  {t('paymentLink.remove')}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
