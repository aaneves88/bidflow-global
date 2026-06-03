import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { LogoUpload } from '@/components/LogoUpload';
import { useCreateClient, useUpdateClient, type ClientFormData } from '@/hooks/useClients';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: any;
};

const empty: ClientFormData = {
  name: '', email: '', phone: '', company: '', notes: '',
  logo_url: '', tax_id: '', address_line: '', city: '', state: '', postal_code: '', country: '',
};

export function ClientDialog({ open, onOpenChange, client }: Props) {
  const { t } = useTranslation(['clients', 'common']);
  const create = useCreateClient();
  const update = useUpdateClient();
  const isEditing = !!client;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ClientFormData>({
    defaultValues: empty,
  });

  useEffect(() => {
    if (open) {
      reset(client ? {
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        notes: client.notes || '',
        logo_url: client.logo_url || '',
        tax_id: client.tax_id || '',
        address_line: client.address_line || '',
        city: client.city || '',
        state: client.state || '',
        postal_code: client.postal_code || '',
        country: client.country || '',
      } : empty);
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('dialog.editTitle') : t('dialog.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identification */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('dialog.sections.identification')}
            </h3>
            <div>
              <Label>{t('dialog.logo')}</Label>
              <Controller
                control={control}
                name="logo_url"
                render={({ field }) => (
                  <LogoUpload value={field.value || ''} onChange={field.onChange} />
                )}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{t('dialog.name')} *</Label>
                <Input id="name" {...register('name', { required: t('dialog.nameRequired') })} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="company">{t('dialog.company')}</Label>
                <Input id="company" {...register('company')} />
              </div>
              <div>
                <Label htmlFor="tax_id">{t('dialog.taxId')}</Label>
                <Input id="tax_id" {...register('tax_id')} placeholder={t('dialog.taxIdPlaceholder')} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Contact */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('dialog.sections.contact')}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">{t('dialog.email')}</Label>
                <Input id="email" type="email" {...register('email')} />
              </div>
              <div>
                <Label htmlFor="phone">{t('dialog.phone')}</Label>
                <Input id="phone" {...register('phone')} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Address */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('dialog.sections.address')}
            </h3>
            <div>
              <Label htmlFor="address_line">{t('dialog.addressLine')}</Label>
              <Input id="address_line" {...register('address_line')} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">{t('dialog.city')}</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div>
                <Label htmlFor="state">{t('dialog.state')}</Label>
                <Input id="state" {...register('state')} />
              </div>
              <div>
                <Label htmlFor="postal_code">{t('dialog.postalCode')}</Label>
                <Input id="postal_code" {...register('postal_code')} />
              </div>
            </div>
            <div>
              <Label htmlFor="country">{t('dialog.country')}</Label>
              <Input id="country" {...register('country')} />
            </div>
          </section>

          <Separator />

          {/* Notes */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('dialog.sections.notes')}
            </h3>
            <div>
              <Label htmlFor="notes">{t('dialog.notes')}</Label>
              <Textarea id="notes" {...register('notes')} rows={3} />
            </div>
          </section>

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
