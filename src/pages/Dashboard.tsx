import { useAuth } from '@/contexts/AuthContext';
import { useProposals, useProposalStatuses } from '@/hooks/useProposals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/format';
import { FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: proposals } = useProposals();
  const { data: statuses } = useProposalStatuses();
  const navigate = useNavigate();

  const now = new Date();
  const thisMonth = proposals?.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const approvedStatus = statuses?.find((s) => s.name === 'Approved');
  const approved = proposals?.filter((p) => p.status_id === approvedStatus?.id) || [];
  const approvedValue = approved.reduce((s, p) => s + Number(p.total_amount), 0);

  const finalStatuses = statuses?.filter((s) => s.is_final).map((s) => s.id) || [];
  const openProposals = proposals?.filter((p) => !finalStatuses.includes(p.status_id || '')) || [];

  const total = proposals?.length || 0;
  const conversionRate = total > 0 ? ((approved.length / total) * 100).toFixed(1) : '0';

  const recentProposals = proposals?.slice(0, 5) || [];

  // Pipeline: count per status
  const pipeline = statuses?.map((s) => ({
    ...s,
    count: proposals?.filter((p) => p.status_id === s.id).length || 0,
  })) || [];
  const maxCount = Math.max(...pipeline.map((p) => p.count), 1);

  const kpis = [
    { label: 'Proposals (this month)', value: String(thisMonth?.length || 0), icon: FileText },
    { label: 'Open Pipeline', value: String(openProposals.length), icon: Clock },
    { label: 'Approved Revenue', value: formatCurrency(approvedValue), icon: CheckCircle },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
        </p>
      </div>

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
          <CardHeader><CardTitle>Pipeline</CardTitle></CardHeader>
          <CardContent>
            {pipeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
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
          <CardHeader><CardTitle>Recent Proposals</CardTitle></CardHeader>
          <CardContent>
            {recentProposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No proposals yet</p>
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
                      <p className="text-xs text-muted-foreground">{p.clients?.name || 'No client'} · {formatDate(p.created_at)}</p>
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
