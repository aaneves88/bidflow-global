import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useProposals, useProposalStatuses } from '@/hooks/useProposals';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  FileText, Clock, CheckCircle, TrendingUp, AlertTriangle,
  DollarSign, ArrowUpRight, ArrowDownRight, Users, PlusCircle, Activity,
} from 'lucide-react';

type Period = 'thisMonth' | 'last30Days' | 'thisYear' | 'allTime';

function getRange(period: Period): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  const end = now;
  let start: Date;
  let prevStart: Date;
  let prevEnd: Date;
  switch (period) {
    case 'thisMonth': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    }
    case 'last30Days': {
      start = new Date(now.getTime() - 30 * 86400000);
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd.getTime() - 30 * 86400000);
      break;
    }
    case 'thisYear': {
      start = new Date(now.getFullYear(), 0, 1);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      break;
    }
    default: {
      start = new Date(0);
      prevStart = new Date(0);
      prevEnd = new Date(0);
    }
  }
  return { start, end, prevStart, prevEnd };
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return (
      <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400">
        <ArrowUpRight className="h-3 w-3" />
        novo
      </span>
    );
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const color = up ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive';
  return (
    <span className={`inline-flex items-center text-xs ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

export default function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuth();
  const { data: proposals } = useProposals();
  const { data: statuses } = useProposalStatuses();
  const { data: clients } = useClients();
  const { data: currentPlan } = useCurrentPlan();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('thisMonth');

  const { start, end, prevStart, prevEnd } = useMemo(() => getRange(period), [period]);

  const filtered = useMemo(() => {
    if (!proposals) return [];
    return proposals.filter((p) => {
      const d = new Date(p.created_at);
      return d >= start && d <= end;
    });
  }, [proposals, start, end]);

  const prevFiltered = useMemo(() => {
    if (!proposals || period === 'allTime') return [];
    return proposals.filter((p) => {
      const d = new Date(p.created_at);
      return d >= prevStart && d <= prevEnd;
    });
  }, [proposals, prevStart, prevEnd, period]);

  const approvedStatus = statuses?.find((s) => /aprov|approv/i.test(s.name));
  const finalStatuses = statuses?.filter((s) => s.is_final).map((s) => s.id) || [];

  const approved = filtered.filter((p) => p.status_id === approvedStatus?.id);
  const approvedRevenue = approved.reduce((s, p) => s + Number(p.total_amount), 0);
  const avgTicket = approved.length > 0 ? approvedRevenue / approved.length : 0;

  const open = filtered.filter((p) => !finalStatuses.includes(p.status_id || ''));
  const openValue = open.reduce((s, p) => s + Number(p.total_amount), 0);

  const total = filtered.length;
  const conversionRate = total > 0 ? (approved.length / total) * 100 : 0;

  // Previous period for deltas
  const prevApproved = prevFiltered.filter((p) => p.status_id === approvedStatus?.id);
  const prevApprovedRevenue = prevApproved.reduce((s, p) => s + Number(p.total_amount), 0);
  const prevAvgTicket = prevApproved.length > 0 ? prevApprovedRevenue / prevApproved.length : 0;
  const prevOpen = prevFiltered.filter((p) => !finalStatuses.includes(p.status_id || ''));
  const prevOpenValue = prevOpen.reduce((s, p) => s + Number(p.total_amount), 0);
  const prevConvRate = prevFiltered.length > 0 ? (prevApproved.length / prevFiltered.length) * 100 : 0;

  const recentProposals = (proposals ?? []).slice(0, 5);

  const pipeline = statuses?.map((s) => ({
    ...s,
    count: filtered.filter((p) => p.status_id === s.id).length,
  })) || [];
  const maxCount = Math.max(...pipeline.map((p) => p.count), 1);

  // Recent activity (status history across user's proposals)
  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity', user?.id],
    queryFn: async () => {
      const ids = (proposals ?? []).map((p) => p.id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('proposal_status_history')
        .select('id, created_at, proposal_id, proposal_statuses(name, color), proposals(title)')
        .in('proposal_id', ids)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!proposals && proposals.length > 0,
  });

  const isEmpty = (proposals?.length ?? 0) === 0 && (clients?.length ?? 0) === 0;

  const kpis = [
    {
      label: t('kpis.thisMonth'),
      value: String(filtered.length),
      icon: FileText,
      current: filtered.length,
      previous: prevFiltered.length,
    },
    {
      label: t('kpis.openPipeline'),
      value: formatCurrency(openValue),
      icon: Clock,
      current: openValue,
      previous: prevOpenValue,
    },
    {
      label: t('kpis.approvedRevenue'),
      value: formatCurrency(approvedRevenue),
      icon: CheckCircle,
      current: approvedRevenue,
      previous: prevApprovedRevenue,
    },
    {
      label: t('kpis.avgTicket'),
      value: formatCurrency(avgTicket),
      icon: DollarSign,
      current: avgTicket,
      previous: prevAvgTicket,
    },
    {
      label: t('kpis.conversionRate'),
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      current: conversionRate,
      previous: prevConvRate,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('welcomeBack')}{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('period.label')}:</span>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">{t('period.thisMonth')}</SelectItem>
              <SelectItem value="last30Days">{t('period.last30Days')}</SelectItem>
              <SelectItem value="thisYear">{t('period.thisYear')}</SelectItem>
              <SelectItem value="allTime">{t('period.allTime')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentPlan?.isExpired && (
        <Card className="border-destructive">
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm">{t('trial.expired')}</p>
            </div>
            <Button asChild><Link to="/pricing">{t('trial.upgrade')}</Link></Button>
          </CardContent>
        </Card>
      )}

      {currentPlan && !currentPlan.isExpired && currentPlan.daysLeft !== null && currentPlan.daysLeft <= 7 && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <p className="text-sm">{t('trial.active', { days: currentPlan.daysLeft })}</p>
            <Button variant="outline" asChild><Link to="/pricing">{t('trial.upgrade')}</Link></Button>
          </CardContent>
        </Card>
      )}

      {isEmpty && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>{t('quickStart.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('quickStart.subtitle')}</p>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link to="/clients"><Users className="mr-2 h-4 w-4" />{t('quickStart.addClient')}</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/proposals/new"><PlusCircle className="mr-2 h-4 w-4" />{t('quickStart.createProposal')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1 truncate">{kpi.value}</p>
                  {period !== 'allTime' && (
                    <div className="mt-1">
                      <Delta current={kpi.current} previous={kpi.previous} />
                    </div>
                  )}
                </div>
                <kpi.icon className="h-7 w-7 text-muted-foreground/40 shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('pipeline.title')}</CardTitle></CardHeader>
          <CardContent>
            {pipeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('pipeline.empty')}</p>
            ) : (
              <div className="space-y-3">
                {pipeline.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-sm w-20 truncate" title={s.name}>{s.name}</span>
                    <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all"
                        style={{
                          width: `${(s.count / maxCount) * 100}%`,
                          backgroundColor: s.color,
                          minWidth: s.count > 0 ? '1.5rem' : 0,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('recent.title')}</CardTitle></CardHeader>
          <CardContent>
            {recentProposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('recent.empty')}</p>
            ) : (
              <div className="space-y-3">
                {recentProposals.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between cursor-pointer rounded-md p-2 hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/proposals/${p.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.clients?.name || t('recent.noClient')} · {formatDate(p.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(Number(p.total_amount), p.currency)}</span>
                      {p.proposal_statuses && (
                        <Badge variant="outline" style={{ borderColor: p.proposal_statuses.color, color: p.proposal_statuses.color }}>
                          {p.proposal_statuses.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> {t('activity.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activity || activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('activity.empty')}</p>
          ) : (
            <div className="space-y-2">
              {activity.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-sm rounded-md p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/proposals/${a.proposal_id}`)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate font-medium">{a.proposals?.title ?? '—'}</span>
                    {a.proposal_statuses && (
                      <Badge
                        variant="outline"
                        style={{ borderColor: a.proposal_statuses.color, color: a.proposal_statuses.color }}
                      >
                        {a.proposal_statuses.name}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-3">{formatDate(a.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
