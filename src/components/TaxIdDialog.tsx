import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { isValidPixKey } from '@/lib/pix';
import { DuplicateTaxIdError, useSaveTaxId, type TaxIdType } from '@/hooks/useTaxId';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chamado após gravar o documento com sucesso. */
  onConfirmed: () => void;
}

const TAX_ID_TYPES: TaxIdType[] = ['cpf', 'cnpj'];

export function TaxIdDialog({ open, onOpenChange, onConfirmed }: Props) {
  const { t } = useTranslation(['proposals', 'common']);
  const [type, setType] = useState<TaxIdType>('cpf');
  const [value, setValue] = useState('');
  const save = useSaveTaxId();

  const handleConfirm = async () => {
    const trimmed = value.trim();
    if (!isValidPixKey(trimmed, type)) {
      toast({ title: t('form.taxId.invalid'), variant: 'destructive' });
      return;
    }
    try {
      await save.mutateAsync({ taxId: trimmed, taxIdType: type });
      onOpenChange(false);
      onConfirmed();
    } catch (e: any) {
      toast({
        title: e instanceof DuplicateTaxIdError ? t('form.taxId.duplicate') : t('form.taxId.saveError'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!save.isPending) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t('form.taxId.title')}
          </DialogTitle>
          <DialogDescription>{t('form.taxId.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>{t('form.taxId.type')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as TaxIdType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TAX_ID_TYPES.map((tp) => (
                  <SelectItem key={tp} value={tp}>{t(`form.taxId.types.${tp}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tax_id">{t('form.taxId.field')}</Label>
            <Input
              id="tax_id"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t(`form.taxId.placeholder.${type}`)}
              inputMode="numeric"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{t('form.taxId.hint')}</p>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={save.isPending}>
            {save.isPending ? t('common:actions.saving') : t('form.taxId.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
