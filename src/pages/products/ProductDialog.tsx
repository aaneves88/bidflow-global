import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  MAX_PRODUCT_IMAGES, MAX_PRODUCT_IMAGE_BYTES, PRODUCT_IMAGE_TYPES,
  signProductImages, uploadProductImage, removeProductImage,
} from '@/lib/productImages';
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
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const paths = product?.image_urls ?? [];
    setImages(paths);
    signProductImages(paths, 3600).then((urls) =>
      setPreviews(Object.fromEntries(paths.map((p, i) => [p, urls[i]]))));
  }, [open, product]);

  const onFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    const room = MAX_PRODUCT_IMAGES - images.length;
    const list = Array.from(files).slice(0, room);
    setUploading(true);
    try {
      for (const f of list) {
        if (!PRODUCT_IMAGE_TYPES.includes(f.type) || f.size > MAX_PRODUCT_IMAGE_BYTES) {
          toast({ title: t('form.imageInvalid'), variant: 'destructive' });
          continue;
        }
        const path = await uploadProductImage(user.id, f);
        setImages((prev) => [...prev, path]);
        setPreviews((prev) => ({ ...prev, [path]: URL.createObjectURL(f) }));
      }
    } catch (e: any) {
      toast({ title: t('form.imageInvalid'), description: e?.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (path: string) => {
    setImages((prev) => prev.filter((p) => p !== path));
  };

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
    const payload = { ...data, default_price: Number(data.default_price) || 0, image_urls: images };
    if (isEditing) {
      await update.mutateAsync({ ...payload, id: product!.id });
    } else {
      await create.mutateAsync(payload);
    }
    // Delete removed photos only after the product is saved.
    (product?.image_urls ?? []).filter((p) => !images.includes(p)).forEach((p) => removeProductImage(p));
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

          <div>
            <Label>{t('form.images')}</Label>
            <p className="text-xs text-muted-foreground mb-2">{t('form.imagesHint')}</p>
            <div className="flex flex-wrap gap-2">
              {images.map((path) => (
                <div key={path} className="relative h-20 w-20 overflow-hidden rounded-md border">
                  {previews[path] && <img src={previews[path]} alt="" className="h-full w-full object-cover" />}
                  <button
                    type="button"
                    onClick={() => removeImage(path)}
                    aria-label={t('form.removeImage')}
                    className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < MAX_PRODUCT_IMAGES && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed text-muted-foreground hover:border-primary"
                  aria-label={t('form.addImage')}
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={PRODUCT_IMAGE_TYPES.join(',')}
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
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
            <Button type="submit" disabled={create.isPending || update.isPending || uploading}>
              {t('common:actions.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
