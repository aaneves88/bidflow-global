import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { usePlans } from '@/hooks/usePlans';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface PlanForm {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string;
  is_active: boolean;
  is_starter: boolean;
  trial_days: number;
  max_proposals: string;
  max_clients: string;
}

const emptyForm: PlanForm = {
  name: '', description: '', price: 0, currency: 'BRL', interval: 'month',
  features: '', is_active: true, is_starter: false, trial_days: 0,
  max_proposals: '', max_clients: '',
};

export default function AdminPlans() {
  const { t } = useTranslation(['admin', 'common']);
  const { plans, isLoading, upsertPlan } = usePlans(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);

  const openEdit = (plan: any) => {
    setForm({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price: plan.price || 0,
      currency: plan.currency || 'BRL',
      interval: plan.interval || 'month',
      features: JSON.stringify(plan.features || [], null, 2),
      is_active: plan.is_active ?? true,
      is_starter: plan.is_starter ?? false,
      trial_days: plan.trial_days ?? 0,
      max_proposals: plan.max_proposals === null || plan.max_proposals === undefined ? '' : String(plan.max_proposals),
      max_clients: plan.max_clients === null || plan.max_clients === undefined ? '' : String(plan.max_clients),
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      let features: any = [];
      try { features = JSON.parse(form.features); } catch { features = []; }

      await upsertPlan.mutateAsync({
        ...(form.id ? { id: form.id } : {}),
        name: form.name,
        description: form.description || null,
        price: form.price,
        currency: form.currency,
        interval: form.interval,
        features,
        is_active: form.is_active,
        is_starter: form.is_starter,
        trial_days: form.trial_days,
        max_proposals: form.max_proposals === '' ? null : Number(form.max_proposals),
        max_clients: form.max_clients === '' ? null : Number(form.max_clients),
      } as any);
      toast({ title: form.id ? t('plans.messages.updated') : t('plans.messages.created') });
      setOpen(false);
      setForm(emptyForm);
    } catch {
      toast({ title: t('plans.messages.error'), variant: 'destructive' });
    }
  };

  if (isLoading) return <p className="text-muted-foreground mt-4">{t('plans.loading')}</p>;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(emptyForm); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> {t('plans.newButton')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('plans.table.name')}</TableHead>
            <TableHead>{t('plans.table.price')}</TableHead>
            <TableHead>{t('plans.table.interval')}</TableHead>
            <TableHead>{t('plans.table.status')}</TableHead>
            <TableHead>{t('plans.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                {p.name}
                {p.is_starter && <Badge variant="outline" className="ml-2">starter</Badge>}
              </TableCell>
              <TableCell>{formatCurrency(p.price ?? 0, p.currency ?? 'BRL')}</TableCell>
              <TableCell>{p.interval}</TableCell>
              <TableCell>
                <Badge variant={p.is_active ? 'default' : 'secondary'}>
                  {p.is_active ? t('plans.active') : t('plans.inactive')}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>{t('common:actions.edit')}</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? t('plans.dialog.editTitle') : t('plans.dialog.newTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('plans.dialog.name')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>{t('plans.dialog.description')}</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>{t('plans.dialog.price')}</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <Label>{t('plans.dialog.currency')}</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <Label>{t('plans.dialog.interval')}</Label>
                <Input value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t('plans.dialog.maxProposals')}</Label>
                <Input value={form.max_proposals} onChange={(e) => setForm({ ...form, max_proposals: e.target.value })} placeholder="—" />
              </div>
              <div>
                <Label>{t('plans.dialog.maxClients')}</Label>
                <Input value={form.max_clients} onChange={(e) => setForm({ ...form, max_clients: e.target.value })} placeholder="—" />
              </div>
            </div>
            <div>
              <Label>{t('plans.dialog.trialDays')}</Label>
              <Input type="number" value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })} />
            </div>
            <div>
              <Label>{t('plans.dialog.features')}</Label>
              <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>{t('plans.dialog.isActive')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_starter} onCheckedChange={(v) => setForm({ ...form, is_starter: v })} />
              <Label>{t('plans.dialog.isStarter')}</Label>
            </div>
            <Button onClick={handleSave} disabled={!form.name} className="w-full">{t('common:actions.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
