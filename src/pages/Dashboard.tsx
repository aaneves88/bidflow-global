import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
        </p>
      </div>

      {isAdmin && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-primary">You have admin access</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Proposals', value: '—' },
          { label: 'Open Pipeline', value: '—' },
          { label: 'Approved Revenue', value: '—' },
          { label: 'Conversion Rate', value: '—' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        KPIs and pipeline data will be available once you start creating proposals.
      </p>
    </div>
  );
}
