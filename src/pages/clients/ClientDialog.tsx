import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const { t } = useTranslation(['clients', 'common']);
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
          <DialogTitle>{isEditing ? t('dialog.editTitle') : t('dialog.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('dialog.name')} *</Label>
            <Input id="name" {...register('name', { required: t('dialog.nameRequired') })} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">{t('dialog.email')}</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <div>
            <Label htmlFor="phone">{t('dialog.phone')}</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div>
            <Label htmlFor="company">{t('dialog.company')}</Label>
            <Input id="company" {...register('company')} />
          </div>
          <div>
            <Label htmlFor="notes">{t('dialog.notes')}</Label>
            <Textarea id="notes" {...register('notes')} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common:actions.cancel')}</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEditing ? t('common:actions.update') : t('common:actions.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
