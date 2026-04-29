import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProposals, useProposalStatuses } from '@/hooks/useProposals';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/format';
import { FileText, Clock, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

type Period = 'thisMonth' | 'last30Days' | 'thisYear' | 'allTime';

export default function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuth();
  const { data: proposals } = useProposals();
  const { data: statuses } = useProposalStatuses();
  const { data: currentPlan } = useCurrentPlan();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('thisMonth');

  const filtered = useMemo(() => {
    if (!proposals) return [];
    const now = new Date();
    return proposals.filter((p) => {
      const d = new Date(p.created_at);
      switch (period) {
        case 'thisMonth':
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'last30Days':
          return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
        case 'thisYear':
          return d.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [proposals, period]);

  const approvedStatus = statuses?.find((s) => /aprov|approv/i.test(s.name));
  const finalStatuses = statuses?.filter((s) => s.is_final).map((s) => s.id) || [];

  const approved = filtered.filter((p) => p.status_id === approvedStatus?.id);
  const approvedRevenue = approved.reduce((s, p) => s + Number(p.total_amount), 0);

  const open = filtered.filter((p) => !finalStatuses.includes(p.status_id || ''));
  const openValue = open.reduce((s, p) => s + Number(p.total_amount), 0);

  const total = filtered.length;
  const conversionRate = total > 0 ? ((approved.length / total) * 100).toFixed(1) : '0';

  const recentProposals = (proposals ?? []).slice(0, 5);

  const pipeline = statuses?.map((s) => ({
    ...s,
    count: filtered.filter((p) => p.status_id === s.id).length,
  })) || [];
  const maxCount = Math.max(...pipeline.map((p) => p.count), 1);

  const kpis = [
    { label: t('kpis.thisMonth'), value: String(filtered.length), icon: FileText },
    { label: t('kpis.openPipeline'), value: formatCurrency(openValue), icon: Clock },
    { label: t('kpis.approvedRevenue'), value: formatCurrency(approvedRevenue), icon: CheckCircle },
    { label: t('kpis.conversionRate'), value: `${conversionRate}%`, icon: TrendingUp },
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <kpi.icon className="h-8 w-8 text-muted-foreground/40" />
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
    </div>
  );
}
