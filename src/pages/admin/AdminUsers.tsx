import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminUsers, type ActivityStatus } from '@/hooks/useAdminUsers';
import { usePlans } from '@/hooks/usePlans';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { Shield, Gift, Sparkles, Search } from 'lucide-react';

type Duration = '1m' | '3m' | '6m' | '1y' | 'unlimited';
type StatusFilter = 'all' | ActivityStatus;
type SortKey = 'last_sign_in' | 'proposals' | 'joined';

function computeExpiry(duration: Duration): string | null {
  if (duration === 'unlimited') return null;
  const d = new Date();
  if (duration === '1m') d.setMonth(d.getMonth() + 1);
  if (duration === '3m') d.setMonth(d.getMonth() + 3);
  if (duration === '6m') d.setMonth(d.getMonth() + 6);
  if (duration === '1y') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

function daysAgo(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

const statusVariant: Record<ActivityStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  never: 'destructive',
  no_proposal: 'outline',
  active: 'default',
  inactive: 'secondary',
};

export default function AdminUsers() {
  const { t } = useTranslation('admin');
  const { users, isLoading, toggleAdmin, grantPlan } = useAdminUsers();
  const { plans } = usePlans();
  const { user } = useAuth();
  const [grantDialog, setGrantDialog] = useState<string | null>(null);
  const [duration, setDuration] = useState<Duration>('1m');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('last_sign_in');

  const premiumPlan = useMemo(
    () => plans.find((p) => /premium/i.test(p.name)),
    [plans],
  );

  const counts = useMemo(() => ({
    total: users.length,
    never: users.filter((u) => u.activity_status === 'never').length,
    noProposal: users.filter((u) => u.activity_status === 'no_proposal').length,
    active: users.filter((u) => u.activity_status === 'active').length,
  }), [users]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = users.filter((u) => {
      if (statusFilter !== 'all' && u.activity_status !== statusFilter) return false;
      if (!q) return true;
      return (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    });
    const ts = (v: string | null) => (v ? new Date(v).getTime() : 0);
    return [...filtered].sort((a, b) => {
      if (sortKey === 'proposals') return b.proposals_count - a.proposals_count;
      if (sortKey === 'joined') return ts(b.created_at) - ts(a.created_at);
      return ts(b.last_sign_in_at) - ts(a.last_sign_in_at);
    });
  }, [users, search, statusFilter, sortKey]);

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      await toggleAdmin.mutateAsync({ userId, isCurrentlyAdmin });
      toast({ title: isCurrentlyAdmin ? t('users.messages.adminRemoved') : t('users.messages.adminGranted') });
    } catch {
      toast({ title: t('users.messages.errorRole'), variant: 'destructive' });
    }
  };

  const handleGrantPremium = async (targetUser: { id: string; full_name: string | null; email: string | null }) => {
    if (!premiumPlan || !user) {
      toast({ title: t('users.messages.errorPlan'), variant: 'destructive' });
      return;
    }
    try {
      await grantPlan.mutateAsync({
        userId: targetUser.id,
        planId: premiumPlan.id,
        grantedBy: user.id,
        expiresAt: computeExpiry(duration),
      });
      toast({
        title: t('users.messages.premiumGranted', {
          name: targetUser.full_name || targetUser.email || '',
        }),
      });
      setGrantDialog(null);
      setDuration('1m');
      setReason('');
    } catch {
      toast({ title: t('users.messages.errorPlan'), variant: 'destructive' });
    }
  };

  const renderAgo = (iso: string | null) => {
    const d = daysAgo(iso);
    if (d === null) return <span className="text-muted-foreground">—</span>;
    return (
      <span title={new Date(iso as string).toLocaleString()}>
        {d === 0 ? t('users.activity.today') : t('users.activity.daysAgo', { count: d })}
      </span>
    );
  };

  if (isLoading) return <p className="text-muted-foreground mt-4">{t('users.loading')}</p>;

  const summary = [
    { label: t('users.activity.summary.total'), value: counts.total },
    { label: t('users.activity.summary.never'), value: counts.never },
    { label: t('users.activity.summary.noProposal'), value: counts.noProposal },
    { label: t('users.activity.summary.active'), value: counts.active },
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('users.activity.searchPlaceholder')}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('users.activity.filters.all')}</SelectItem>
            <SelectItem value="never">{t('users.activity.status.never')}</SelectItem>
            <SelectItem value="no_proposal">{t('users.activity.status.no_proposal')}</SelectItem>
            <SelectItem value="active">{t('users.activity.status.active')}</SelectItem>
            <SelectItem value="inactive">{t('users.activity.status.inactive')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="last_sign_in">{t('users.activity.sort.lastSignIn')}</SelectItem>
            <SelectItem value="proposals">{t('users.activity.sort.proposals')}</SelectItem>
            <SelectItem value="joined">{t('users.activity.sort.joined')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.table.name')}</TableHead>
              <TableHead>{t('users.table.email')}</TableHead>
              <TableHead>{t('users.activity.columns.status')}</TableHead>
              <TableHead>{t('users.activity.columns.lastSignIn')}</TableHead>
              <TableHead>{t('users.activity.columns.proposals')}</TableHead>
              <TableHead>{t('users.activity.columns.clients')}</TableHead>
              <TableHead>{t('users.table.plan')}</TableHead>
              <TableHead>{t('users.table.joined')}</TableHead>
              <TableHead>{t('users.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                  {t('users.activity.empty')}
                </TableCell>
              </TableRow>
            )}
            {visible.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{u.full_name || '—'}</span>
                    {u.is_premium && (
                      <Badge variant={u.is_courtesy ? 'outline' : 'default'} className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        {u.is_courtesy ? t('users.badges.premiumCourtesy') : t('users.badges.premium')}
                      </Badge>
                    )}
                    {u.roles.includes('admin') && <Badge variant="secondary">admin</Badge>}
                  </div>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[u.activity_status]}>
                    {t(`users.activity.status.${u.activity_status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">{renderAgo(u.last_sign_in_at)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  <span className="font-semibold tabular-nums">{u.proposals_count}</span>
                  {u.last_proposal_at && (
                    <span className="text-muted-foreground ml-2">{renderAgo(u.last_proposal_at)}</span>
                  )}
                </TableCell>
                <TableCell className="tabular-nums">{u.clients_count}</TableCell>
                <TableCell>{u.current_plan || '—'}</TableCell>
                <TableCell className="whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAdmin(u.id, u.roles.includes('admin'))}
                      disabled={u.id === user?.id}
                      title={u.id === user?.id ? t('users.cantRemoveSelf') : ''}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {u.roles.includes('admin') ? t('users.removeAdmin') : t('users.makeAdmin')}
                    </Button>
                    <Dialog
                      open={grantDialog === u.id}
                      onOpenChange={(open) => {
                        setGrantDialog(open ? u.id : null);
                        if (!open) {
                          setDuration('1m');
                          setReason('');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Gift className="h-3 w-3 mr-1" /> {t('users.grantPremium')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('users.grantDialog.title')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {t('users.grantDialog.forUser', { name: u.full_name || u.email })}
                          </p>
                          <div>
                            <Label>{t('users.grantDialog.duration')}</Label>
                            <Select value={duration} onValueChange={(v) => setDuration(v as Duration)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1m">{t('users.grantDialog.durations.1m')}</SelectItem>
                                <SelectItem value="3m">{t('users.grantDialog.durations.3m')}</SelectItem>
                                <SelectItem value="6m">{t('users.grantDialog.durations.6m')}</SelectItem>
                                <SelectItem value="1y">{t('users.grantDialog.durations.1y')}</SelectItem>
                                <SelectItem value="unlimited">{t('users.grantDialog.durations.unlimited')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>{t('users.grantDialog.reason')}</Label>
                            <Input
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder={t('users.grantDialog.reasonPlaceholder')}
                            />
                          </div>
                          <Button
                            onClick={() => handleGrantPremium(u)}
                            disabled={!premiumPlan || grantPlan.isPending}
                            className="w-full"
                          >
                            {t('users.grantDialog.submit')}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
