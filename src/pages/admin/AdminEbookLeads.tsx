import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Download, Mail, UserCheck, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';

type Period = 'today' | '7d' | '30d' | 'all';

function periodStart(period: Period): Date | null {
  const now = new Date();
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

export default function AdminEbookLeads() {
  const { t } = useTranslation('admin');
  const [period, setPeriod] = useState<Period>('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['admin_ebook_leads'],
    queryFn: async () => {
      const { data: leads, error } = await supabase
        .from('ebook_leads')
        .select('id, name, email, source, created_at, utm_source, utm_medium, utm_campaign, utm_content, referrer')
        .order('created_at', { ascending: false })
        .limit(2000);
      if (error) throw error;

      const emails = Array.from(
        new Set((leads ?? []).map((l) => (l.email || '').trim().toLowerCase()).filter(Boolean)),
      );

      const registered = new Set<string>();
      for (let i = 0; i < emails.length; i += 200) {
        const chunk = emails.slice(i, i + 200);
        const { data: profs } = await supabase.from('profiles').select('email').in('email', chunk);
        (profs ?? []).forEach((p) => p.email && registered.add(p.email.trim().toLowerCase()));
      }

      return { leads: leads ?? [], registered };
    },
  });

  const rows = useMemo(() => {
    const start = periodStart(period);
    return (data?.leads ?? []).filter((l) => !start || new Date(l.created_at) >= start);
  }, [data, period]);

  const converted = rows.filter((l) => data?.registered.has((l.email || '').trim().toLowerCase())).length;
  const rate = rows.length ? Math.round((converted / rows.length) * 1000) / 10 : 0;

  const exportCsv = () => {
    const header = [
      'name',
      'email',
      'source',
      'created_at',
      'registered',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'referrer',
    ];
    const lines = rows.map((l) =>
      [
        l.name ?? '',
        l.email,
        l.source ?? '',
        l.created_at,
        data?.registered.has((l.email || '').trim().toLowerCase()) ? 'yes' : 'no',
        l.utm_source ?? '',
        l.utm_medium ?? '',
        l.utm_campaign ?? '',
        l.utm_content ?? '',
        l.referrer ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [header.join(','), ...lines].join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebook-leads-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { title: t('leads.total'), value: rows.length, icon: Mail },
    { title: t('leads.converted'), value: converted, icon: UserCheck },
    { title: t('leads.rate'), value: `${rate}%`, icon: Percent },
  ];

  return (
    <div className="space-y-6 mt-4">
      <div>
        <h2 className="text-xl font-semibold">{t('leads.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('leads.subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="today">{t('leads.periods.today')}</TabsTrigger>
            <TabsTrigger value="7d">{t('leads.periods.7d')}</TabsTrigger>
            <TabsTrigger value="30d">{t('leads.periods.30d')}</TabsTrigger>
            <TabsTrigger value="all">{t('leads.periods.all')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
          <Download className="mr-2 h-4 w-4" />
          {t('leads.exportCsv')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <p className="p-4 text-muted-foreground">{t('leads.loading')}</p>
          ) : rows.length === 0 ? (
            <p className="p-4 text-muted-foreground">{t('leads.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('leads.table.name')}</TableHead>
                  <TableHead>{t('leads.table.email')}</TableHead>
                  <TableHead>{t('leads.table.source')}</TableHead>
                  <TableHead>{t('leads.table.date')}</TableHead>
                  <TableHead>{t('leads.table.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((l) => {
                  const isReg = data?.registered.has((l.email || '').trim().toLowerCase());
                  return (
                    <TableRow key={l.id}>
                      <TableCell>{l.name || '—'}</TableCell>
                      <TableCell>{l.email}</TableCell>
                      <TableCell className="text-muted-foreground">{l.source}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateTime(l.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={isReg ? 'default' : 'secondary'}>
                          {isReg ? t('leads.registered') : t('leads.notRegistered')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
