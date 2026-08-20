import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

type ReferralStatus = 'pending' | 'converted' | 'paid';
type StatusFilter = 'all' | ReferralStatus;

const SAFETY_WINDOW_DAYS = 14;

interface AdminReferral {
  id: string;
  referral_code: string;
  status: ReferralStatus;
  discount_percent: number;
  created_at: string;
  converted_at: string | null;
  paid_at: string | null;
  reward_granted_at: string | null;
  referrer_full_name: string | null;
  referrer_email: string | null;
  referred_full_name: string | null;
  referred_email: string | null;
}

const statusVariant: Record<ReferralStatus, 'default' | 'secondary' | 'outline'> = {
  pending: 'outline',
  converted: 'secondary',
  paid: 'default',
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—');

const daysSince = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);


type PendingAction = { id: string; kind: 'paid' | 'reward'; early?: boolean } | null;

export default function AdminReferrals() {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pending, setPending] = useState<PendingAction>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin_referrals'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_referrals');
      if (error) throw error;
      return (data ?? []) as AdminReferral[];
    },
  });

  const updateReferral = useMutation({
    mutationFn: async ({ id, kind }: { id: string; kind: 'paid' | 'reward' }) => {
      const patch = kind === 'paid'
        ? { status: 'paid', paid_at: new Date().toISOString() }
        : { reward_granted_at: new Date().toISOString() };
      const { error } = await supabase.from('referrals').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin_referrals'] });
      toast.success(t(vars.kind === 'paid' ? 'referrals.actions.markedPaid' : 'referrals.actions.markedReward'));
    },
    onError: () => toast.error(t('referrals.actions.error')),
  });


  const referrals = data ?? [];

  const counts = useMemo(() => ({
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    closed: referrals.filter((r) => r.status === 'converted' || r.status === 'paid').length,
  }), [referrals]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return referrals.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.referrer_full_name, r.referrer_email, r.referred_full_name, r.referred_email, r.referral_code]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [referrals, search, statusFilter]);

  if (isLoading) return <p className="text-muted-foreground mt-4">{t('referrals.loading')}</p>;

  const summary = [
    { label: t('referrals.summary.total'), value: counts.total },
    { label: t('referrals.summary.pending'), value: counts.pending },
    { label: t('referrals.summary.closed'), value: counts.closed },
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
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
            placeholder={t('referrals.searchPlaceholder')}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('referrals.filters.all')}</SelectItem>
            <SelectItem value="pending">{t('referrals.status.pending')}</SelectItem>
            <SelectItem value="converted">{t('referrals.status.converted')}</SelectItem>
            <SelectItem value="paid">{t('referrals.status.paid')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('referrals.columns.referrer')}</TableHead>
              <TableHead>{t('referrals.columns.referred')}</TableHead>
              <TableHead>{t('referrals.columns.code')}</TableHead>
              <TableHead>{t('referrals.columns.status')}</TableHead>
              <TableHead>{t('referrals.columns.createdAt')}</TableHead>
              <TableHead>{t('referrals.columns.convertedAt')}</TableHead>
              <TableHead>{t('referrals.columns.paidAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                  {t('referrals.empty')}
                </TableCell>
              </TableRow>
            )}
            {visible.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <div>{r.referrer_full_name || '—'}</div>
                  <div className="text-xs text-muted-foreground">{r.referrer_email || ''}</div>
                </TableCell>
                <TableCell>
                  <div>{r.referred_full_name || '—'}</div>
                  <div className="text-xs text-muted-foreground">{r.referred_email || ''}</div>
                </TableCell>
                <TableCell className="font-mono text-xs">{r.referral_code}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[r.status]}>{t(`referrals.status.${r.status}`)}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">{fmt(r.created_at)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{fmt(r.converted_at)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{fmt(r.paid_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
