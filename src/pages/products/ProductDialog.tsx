import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateProduct, useUpdateProduct, type ProductFormData, type Product } from '@/hooks/useProducts';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
};

const empty: ProductFormData = {
  name: '', description: '', default_price: 0, unit: 'un', is_active: true,
};

export function ProductDialog({ open, onOpenChange, product }: Props) {
  const { t } = useTranslation(['products', 'common']);
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const isEditing = !!product;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: empty,
  });

  useEffect(() => {
    if (open) {
      reset(product ? {
        name: product.name,
        description: product.description || '',
        default_price: Number(product.default_price) || 0,
        unit: product.unit || 'un',
        is_active: product.is_active,
      } : empty);
    }
  }, [open, product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    const payload = { ...data, default_price: Number(data.default_price) || 0 };
    if (isEditing) {
      await update.mutateAsync({ ...payload, id: product!.id });
    } else {
      await create.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.editTitle') : t('form.newTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('form.name')} *</Label>
            <Input
              id="name"
              placeholder={t('form.namePlaceholder')}
              {...register('name', { required: t('form.nameRequired') })}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">{t('form.description')}</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder={t('form.descriptionPlaceholder')}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_price">{t('form.price')}</Label>
              <Input
                id="default_price"
                type="number"
                min="0"
                step="0.01"
                {...register('default_price', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="unit">{t('form.unit')}</Label>
              <Input id="unit" placeholder={t('form.unitPlaceholder')} {...register('unit')} />
            </div>
          </div>

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch id="is_active" checked={!!field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="is_active" className="font-normal">{t('form.isActive')}</Label>
              </div>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {t('common:actions.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
