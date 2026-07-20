import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { usePlans } from '@/hooks/usePlans';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { Shield, Gift, Sparkles } from 'lucide-react';

type Duration = '1m' | '3m' | '6m' | '1y' | 'unlimited';

function computeExpiry(duration: Duration): string | null {
  if (duration === 'unlimited') return null;
  const d = new Date();
  if (duration === '1m') d.setMonth(d.getMonth() + 1);
  if (duration === '3m') d.setMonth(d.getMonth() + 3);
  if (duration === '6m') d.setMonth(d.getMonth() + 6);
  if (duration === '1y') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export default function AdminUsers() {
  const { t } = useTranslation('admin');
  const { users, isLoading, toggleAdmin, grantPlan } = useAdminUsers();
  const { plans } = usePlans();
  const { user } = useAuth();
  const [grantDialog, setGrantDialog] = useState<string | null>(null);
  const [duration, setDuration] = useState<Duration>('1m');
  const [reason, setReason] = useState('');

  const premiumPlan = useMemo(
    () => plans.find((p) => /premium/i.test(p.name)),
    [plans],
  );

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

  if (isLoading) return <p className="text-muted-foreground mt-4">{t('users.loading')}</p>;

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('users.table.name')}</TableHead>
            <TableHead>{t('users.table.email')}</TableHead>
            <TableHead>{t('users.table.roles')}</TableHead>
            <TableHead>{t('users.table.plan')}</TableHead>
            <TableHead>{t('users.table.joined')}</TableHead>
            <TableHead>{t('users.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
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
                </div>
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {u.roles.map((r) => (
                    <Badge key={r} variant={r === 'admin' ? 'default' : 'secondary'}>{r}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{u.current_plan || '—'}</TableCell>
              <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
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
  );
}
