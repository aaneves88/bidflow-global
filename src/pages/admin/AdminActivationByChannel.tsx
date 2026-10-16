import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type ChannelRow = {
  channel_label: string;
  is_internal: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  accounts: number;
  with_client: number;
  with_proposal: number;
  with_paywall_viewed: number;
  with_checkout_started: number;
  paid: number;
};

const COLS = ['accounts', 'with_proposal', 'with_client', 'with_paywall_viewed', 'with_checkout_started', 'paid'] as const;

export default function AdminActivationByChannel() {
  const { t } = useTranslation('admin');
  const { data, isLoading } = useQuery({
    queryKey: ['admin_activation_by_channel'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_activation_by_channel');
      if (error) throw error;
      return (data ?? []) as unknown as ChannelRow[];
    },
  });

  const label = (r: ChannelRow) =>
    r.is_internal ? t('activation.channel.internal') : r.utm_source ? r.channel_label : t('activation.channel.direct');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activation.channel.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('activation.loading')}</p>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">{t('activation.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">{t('activation.channel.cols.channel')}</th>
                  {COLS.map((c) => (
                    <th key={c} className="py-2 px-2 font-medium text-right whitespace-nowrap">
                      {t(`activation.channel.cols.${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr
                    key={r.channel_label}
                    className={cn('border-b last:border-0', r.is_internal && 'bg-muted/40 text-muted-foreground')}
                  >
                    <td className="py-2 pr-4">
                      <div className="font-medium break-all">{label(r)}</div>
                      {r.is_internal && (
                        <div className="text-xs italic">{t('activation.channel.internalNote')}</div>
                      )}
                    </td>
                    {COLS.map((c) => (
                      <td key={c} className="py-2 px-2 text-right tabular-nums">{r[c]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
