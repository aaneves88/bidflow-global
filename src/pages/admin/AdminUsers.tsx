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
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Shield, Gift } from 'lucide-react';

export default function AdminUsers() {
  const { users, isLoading, toggleAdmin, grantPlan } = useAdminUsers();
  const { plans } = usePlans();
  const { user } = useAuth();
  const [grantDialog, setGrantDialog] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      await toggleAdmin.mutateAsync({ userId, isCurrentlyAdmin });
      toast({ title: isCurrentlyAdmin ? 'Admin role removed' : 'Admin role granted' });
    } catch {
      toast({ title: 'Error updating role', variant: 'destructive' });
    }
  };

  const handleGrantPlan = async () => {
    if (!grantDialog || !selectedPlan || !user) return;
    try {
      await grantPlan.mutateAsync({
        userId: grantDialog,
        planId: selectedPlan,
        grantedBy: user.id,
        expiresAt: expiresAt || undefined,
      });
      toast({ title: 'Plan granted successfully' });
      setGrantDialog(null);
      setSelectedPlan('');
      setExpiresAt('');
    } catch {
      toast({ title: 'Error granting plan', variant: 'destructive' });
    }
  };

  if (isLoading) return <p className="text-muted-foreground mt-4">Loading users...</p>;

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
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
                    title={u.id === user?.id ? "Can't remove your own admin" : ''}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {u.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                  <Dialog open={grantDialog === u.id} onOpenChange={(open) => setGrantDialog(open ? u.id : null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Gift className="h-3 w-3 mr-1" /> Grant Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Grant Plan to {u.full_name || u.email}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Plan</Label>
                          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
                            <SelectContent>
                              {plans.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Expires at (optional)</Label>
                          <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                        </div>
                        <Button onClick={handleGrantPlan} disabled={!selectedPlan} className="w-full">
                          Grant Plan
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
