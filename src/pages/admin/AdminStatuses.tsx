import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useProposalStatuses } from '@/hooks/useProposalStatuses';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface StatusForm {
  id?: string;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
  is_final: boolean;
}

const emptyForm: StatusForm = { name: '', color: '#6B7280', position: 0, is_default: false, is_final: false };

export default function AdminStatuses() {
  const { t } = useTranslation(['admin', 'common']);
  const { statuses, isLoading, upsertStatus, deleteStatus } = useProposalStatuses();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StatusForm>(emptyForm);

  const openEdit = (s: any) => {
    setForm({ id: s.id, name: s.name, color: s.color, position: s.position, is_default: s.is_default ?? false, is_final: s.is_final ?? false });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      await upsertStatus.mutateAsync({
        ...(form.id ? { id: form.id } : {}),
        name: form.name, color: form.color, position: form.position,
        is_default: form.is_default, is_final: form.is_final,
      });
      toast({ title: form.id ? t('statuses.messages.updated') : t('statuses.messages.created') });
      setOpen(false);
      setForm(emptyForm);
    } catch {
      toast({ title: t('statuses.messages.errorSaving'), variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('statuses.deleteConfirm'))) return;
    try {
      await deleteStatus.mutateAsync(id);
      toast({ title: t('statuses.messages.deleted') });
    } catch {
      toast({ title: t('statuses.messages.errorDeleting'), variant: 'destructive' });
    }
  };

  if (isLoading) return <p className="text-muted-foreground mt-4">{t('statuses.loading')}</p>;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm({ ...emptyForm, position: statuses.length }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> {t('statuses.newButton')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('statuses.table.position')}</TableHead>
            <TableHead>{t('statuses.table.color')}</TableHead>
            <TableHead>{t('statuses.table.name')}</TableHead>
            <TableHead>{t('statuses.table.default')}</TableHead>
            <TableHead>{t('statuses.table.final')}</TableHead>
            <TableHead>{t('statuses.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statuses.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.position}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.color}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.is_default ? '✓' : ''}</TableCell>
              <TableCell>{s.is_final ? '✓' : ''}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>{t('common:actions.edit')}</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? t('statuses.dialog.editTitle') : t('statuses.dialog.newTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('statuses.dialog.name')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>{t('statuses.dialog.color')}</Label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-8 w-8 rounded cursor-pointer" />
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div>
              <Label>{t('statuses.dialog.position')}</Label>
              <Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} />
                <Label>{t('statuses.dialog.default')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_final} onCheckedChange={(v) => setForm({ ...form, is_final: v })} />
                <Label>{t('statuses.dialog.final')}</Label>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!form.name} className="w-full">{t('common:actions.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
