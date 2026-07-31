import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/** Abre o Stripe Billing Portal (cancelamento, troca de cartão, faturas). */
export function useStripePortal() {
  const { t } = useTranslation('settings');
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal', { body: {} });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
        return;
      }
      throw new Error(data?.error ?? 'no_url');
    } catch (e: any) {
      toast({
        title: t('subscription.portalError'),
        description: t('subscription.portalErrorHint'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { openPortal, loading };
}
