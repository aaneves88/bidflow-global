import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { useProducts, type Product } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/format';

type Props = {
  onSelect: (product: Product) => void;
  currency?: string;
};

export function ProductPicker({ onSelect, currency }: Props) {
  const { t } = useTranslation('products');
  const [open, setOpen] = useState(false);
  const { data: products } = useProducts(true);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" title={t('picker.trigger')}>
          <Package className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 pointer-events-auto" align="start">
        <Command>
          <CommandInput placeholder={t('picker.placeholder')} />
          <CommandList>
            <CommandEmpty>
              <div className="p-2 text-sm text-muted-foreground space-y-2">
                <p>{t('picker.empty')}</p>
                <Button asChild size="sm" variant="outline">
                  <Link to="/products">{t('picker.manage')}</Link>
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {products?.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.description || ''}`}
                  onSelect={() => { onSelect(p); setOpen(false); }}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    {p.description && (
                      <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                    )}
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
                    {formatCurrency(Number(p.default_price), currency)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
