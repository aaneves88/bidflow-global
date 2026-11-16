import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

type Row = { user_id: string; name: string; email: string; proposal_count: number; monthly_average: number; average_values: Record<string, number>; public_views: number; pdf_owner: number; pdf_public: number; link_copied: number; whatsapp_opened: number; email_sent: number };
const columns = ['proposal_count', 'monthly_average', 'average_values', 'public_views', 'pdf_owner', 'pdf_public', 'link_copied', 'whatsapp_opened', 'email_sent'] as const;

export default function AdminProposalUsage() {
  const { t } = useTranslation('usage');
  const [search, setSearch] = useState('');
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-proposal-usage'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_proposal_usage');
      if (error) throw error;
      return data as unknown as Row[];
    },
  });
  const rows = (data ?? []).filter(row => `${row.name} ${row.email}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{t('adminTitle')}</h2><Button variant="outline" size="icon" aria-label={t('refresh')} title={t('refresh')} disabled={isFetching} onClick={() => void refetch()}><RefreshCw className="h-4 w-4" /></Button></div>
    <p className="text-sm text-muted-foreground">{t('adminNote')}</p>
    <Input className="max-w-sm" placeholder={t('search')} aria-label={t('search')} value={search} onChange={event => setSearch(event.target.value)} />
    {isLoading ? <p>{t('loading')}</p> : error ? <p className="text-destructive">{t('error')}</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left">{t('account')}</th>{columns.map(column => <th key={column} className="p-3 text-right whitespace-nowrap">{t(`columns.${column}`)}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.user_id} className="border-b"><td className="p-3"><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></td>{columns.map(column => <td key={column} className="p-3 text-right tabular-nums whitespace-nowrap">{column === 'average_values' ? Object.entries(row.average_values).map(([currency, value]) => <p key={currency}>{formatCurrency(value, currency)}</p>) : row[column]}</td>)}</tr>)}</tbody></table>{!rows.length && <p className="py-4 text-muted-foreground">{t('empty')}</p>}</div>}
  </section>;
}