import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useProposalStatuses } from '@/hooks/useProposalStatuses';
import { useState } from 'react';
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
        name: form.name,
        color: form.color,
        position: form.position,
        is_default: form.is_default,
        is_final: form.is_final,
      });
      toast({ title: form.id ? 'Status updated' : 'Status created' });
      setOpen(false);
      setForm(emptyForm);
    } catch {
      toast({ title: 'Error saving status', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this status? Proposals using it will lose their status.')) return;
    try {
      await deleteStatus.mutateAsync(id);
      toast({ title: 'Status deleted' });
    } catch {
      toast({ title: 'Error deleting status', variant: 'destructive' });
    }
  };

  if (isLoading) return <p className="text-muted-foreground mt-4">Loading statuses...</p>;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm({ ...emptyForm, position: statuses.length }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Status
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Final</TableHead>
            <TableHead>Actions</TableHead>
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
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>Edit</Button>
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
            <DialogTitle>{form.id ? 'Edit Status' : 'New Status'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-8 w-8 rounded cursor-pointer" />
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div>
              <Label>Position</Label>
              <Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} />
                <Label>Default</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_final} onCheckedChange={(v) => setForm({ ...form, is_final: v })} />
                <Label>Final</Label>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!form.name} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
