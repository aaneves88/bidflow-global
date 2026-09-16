import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NicheRow {
  niche: string;
  page_views: number;
  template_copies: number;
  cta_clicks: number;
  signups: number;
  first_proposals: number;
  public_views: number;
}

const PERIODS = ['7', '30', '90'] as const;

export default function AdminNicheFunnel() {
  const { t } = useTranslation('admin');
  const [days, setDays] = useState<string>('30');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-niche-funnel', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_niche_funnel', {
        p_days: Number(days),
      });
      if (error) throw error;
      return (data ?? []) as NicheRow[];
    },
  });

  const rate = (num: number, den: number) =>
    den > 0 ? `${Math.round((num / den) * 100)}%` : '—';

  return (
    <Card>
      <CardHeader className="gap-4">
        <div>
          <CardTitle>{t('niches.title')}</CardTitle>
          <CardDescription>{t('niches.description')}</CardDescription>
        </div>
        <Tabs value={days} onValueChange={setDays}>
          <TabsList>
            {PERIODS.map((p) => (
              <TabsTrigger key={p} value={p}>
                {t('niches.days', { count: Number(p) })}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('niches.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('niches.columns.niche')}</TableHead>
                  <TableHead className="text-right">{t('niches.columns.views')}</TableHead>
                  <TableHead className="text-right">{t('niches.columns.copies')}</TableHead>
                  <TableHead className="text-right">{t('niches.columns.ctas')}</TableHead>
                  <TableHead className="text-right">{t('niches.columns.signups')}</TableHead>
                  <TableHead className="text-right">{t('niches.columns.proposals')}</TableHead>
                  <TableHead className="text-right">{t('niches.columns.publicViews')}</TableHead>
                  <TableHead className="text-right">{t('niches.columns.conversion')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => (
                  <TableRow key={r.niche}>
                    <TableCell className="font-medium">{r.niche}</TableCell>
                    <TableCell className="text-right">{r.page_views}</TableCell>
                    <TableCell className="text-right">{r.template_copies}</TableCell>
                    <TableCell className="text-right">{r.cta_clicks}</TableCell>
                    <TableCell className="text-right">{r.signups}</TableCell>
                    <TableCell className="text-right">{r.first_proposals}</TableCell>
                    <TableCell className="text-right">{r.public_views}</TableCell>
                    <TableCell className="text-right">{rate(r.signups, r.page_views)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
