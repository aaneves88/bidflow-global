import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function fmt(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function AdminWeekly() {
  const { t } = useTranslation('admin');
  const { data, isLoading } = useQuery({
    queryKey: ['admin_weekly_report'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_weekly_report');
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t('weekly.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('weekly.subtitle')}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">…</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('weekly.empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('weekly.week')}</TableHead>
                <TableHead className="text-right">{t('weekly.newUsers')}</TableHead>
                <TableHead className="text-right">{t('weekly.proposals')}</TableHead>
                <TableHead className="text-right">{t('weekly.paid')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.week_start}>
                  <TableCell>{fmt(r.week_start)} – {fmt(r.week_end)}</TableCell>
                  <TableCell className="text-right font-medium">{r.new_users}</TableCell>
                  <TableCell className="text-right font-medium">{r.proposals_created}</TableCell>
                  <TableCell className="text-right font-medium">{r.paid_subscriptions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
