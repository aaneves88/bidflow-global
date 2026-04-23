import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateClient, useUpdateClient, type ClientFormData } from '@/hooks/useClients';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: any;
};

export function ClientDialog({ open, onOpenChange, client }: Props) {
  const create = useCreateClient();
  const update = useUpdateClient();
  const isEditing = !!client;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormData>({
    defaultValues: { name: '', email: '', phone: '', company: '', notes: '' },
  });

  useEffect(() => {
    if (open) {
      reset(client ? {
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        notes: client.notes || '',
      } : { name: '', email: '', phone: '', company: '', notes: '' });
    }
  }, [open, client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    if (isEditing) {
      await update.mutateAsync({ ...data, id: client.id });
    } else {
      await create.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...register('company')} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
