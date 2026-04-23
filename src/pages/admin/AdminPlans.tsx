import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { usePlans } from '@/hooks/usePlans';
import { useState } from 'react';
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
}

const emptyForm: PlanForm = { name: '', description: '', price: 0, currency: 'USD', interval: 'month', features: '', is_active: true };

export default function AdminPlans() {
  const { plans, isLoading, upsertPlan } = usePlans(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);

  const openEdit = (plan: any) => {
    setForm({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price: plan.price || 0,
      currency: plan.currency || 'USD',
      interval: plan.interval || 'month',
      features: JSON.stringify(plan.features || [], null, 2),
      is_active: plan.is_active ?? true,
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
      });
      toast({ title: form.id ? 'Plan updated' : 'Plan created' });
      setOpen(false);
      setForm(emptyForm);
    } catch {
      toast({ title: 'Error saving plan', variant: 'destructive' });
    }
  };

  if (isLoading) return <p className="text-muted-foreground mt-4">Loading plans...</p>;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(emptyForm); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Plan
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Interval</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{formatCurrency(p.price ?? 0, p.currency ?? 'USD')}</TableCell>
              <TableCell>{p.interval}</TableCell>
              <TableCell>
                <Badge variant={p.is_active ? 'default' : 'secondary'}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Plan' : 'New Plan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Price</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <Label>Interval</Label>
                <Input value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Features (JSON array)</Label>
              <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} disabled={!form.name} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
