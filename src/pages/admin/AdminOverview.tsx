import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/format';

export default function AdminOverview() {
  const { t } = useTranslation('admin');
  const { users } = useAdminUsers();

  const { data: stats } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const { count: totalProposals } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true });

      const { data: statuses } = await supabase
        .from('proposal_statuses')
        .select('id, name')
        .or('name.ilike.%approv%,name.ilike.%aprov%');

      const approvedIds = (statuses ?? []).map((s) => s.id);
      let approvedRevenue = 0;
      if (approvedIds.length > 0) {
        const { data: approved } = await supabase
          .from('proposals')
          .select('total_amount')
          .in('status_id', approvedIds);
        approvedRevenue = (approved ?? []).reduce((sum, p) => sum + Number(p.total_amount), 0);
      }
      return { totalProposals: totalProposals ?? 0, approvedRevenue };
    },
  });

  const cards = [
    { title: t('overview.totalUsers'), value: users.length, icon: Users },
    { title: t('overview.totalProposals'), value: stats?.totalProposals ?? 0, icon: FileText },
    { title: t('overview.approvedRevenue'), value: formatCurrency(stats?.approvedRevenue ?? 0), icon: DollarSign },
  ];

  return (
    <div className="space-y-6 mt-4">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>{t('overview.recentUsers')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{u.full_name || t('overview.noName')}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex gap-1">
                  {u.roles.map((r) => (
                    <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-muted">{r}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
