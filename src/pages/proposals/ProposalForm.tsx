import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2, FileText, Layers, Repeat, PenLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients } from '@/hooks/useClients';
import {
  useProposal, useProposalItems, useProposalStatuses,
  useCreateProposal, useUpdateProposal, type ProposalItem,
} from '@/hooks/useProposals';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { ProductPicker } from '@/components/ProductPicker';
import type { Product } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/format';
import { applyDiscount, discountValue, type DiscountType } from '@/lib/discount';
import { PIX_KEY_TYPES, isValidPixKey, type PixKeyType } from '@/lib/pix';
import { toast } from '@/hooks/use-toast';
import {
  buildProposalTemplate, PROPOSAL_TEMPLATE_IDS, type ProposalTemplateId,
} from '@/lib/proposalTemplates';


const emptyItem = (): ProposalItem => ({
  description: '', quantity: 1, unit_price: 0, total: 0, position: 0,
});

const TEMPLATE_ICONS: Record<ProposalTemplateId, typeof FileText> = {
  simple: FileText,
  phased: Layers,
  recurring: Repeat,
};


export default function ProposalForm() {
  const { t } = useTranslation(['proposals', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: proposal } = useProposal(id);
  const { data: existingItems } = useProposalItems(id);
  const { data: clients } = useClients();
  const { data: statuses } = useProposalStatuses();
  const create = useCreateProposal();
  const update = useUpdateProposal();
  const limits = useSubscription();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!isEditing && limits.isReady && limits.proposalLimitReached) {
      setBlocked(true);
    }
  }, [isEditing, limits.isReady, limits.proposalLimitReached]);


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [clientId, setClientId] = useState<string>('none');
  const [currency, setCurrency] = useState('BRL');
  const [statusId, setStatusId] = useState<string>('');
  const [validUntil, setValidUntil] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<DiscountType>('fixed');
  const [items, setItems] = useState<ProposalItem[]>([emptyItem()]);
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('cpf');
  const [appliedTemplate, setAppliedTemplate] = useState<ProposalTemplateId | null>(null);
  const [pickerDismissed, setPickerDismissed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const applyTemplate = (templateId: ProposalTemplateId) => {
    const tpl = buildProposalTemplate(templateId, (key: string, opts?: any) =>
      t(key, { ns: 'proposals', ...(opts || {}) }) as string);
    setTitle(tpl.title);
    setDescription(tpl.description);
    setNotes(tpl.notes);
    setTerms(tpl.terms);
    setValidUntil(tpl.validUntil);
    setItems(tpl.items);
    setAppliedTemplate(templateId);
    setPickerDismissed(true);
  };

  // Modelo vindo do onboarding / atalhos: /proposals/new?template=simple
  useEffect(() => {
    if (isEditing || appliedTemplate) return;
    const param = searchParams.get('template') as ProposalTemplateId | null;
    if (param && PROPOSAL_TEMPLATE_IDS.includes(param)) {
      applyTemplate(param);
      searchParams.delete('template');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, searchParams]);

  const showPicker = !isEditing && !pickerDismissed;


  useEffect(() => {
    if (proposal && isEditing) {
      setTitle(proposal.title);
      setDescription(proposal.description || '');
      setNotes((proposal as any).notes || '');
      setTerms((proposal as any).terms || '');
      setClientId(proposal.client_id || 'none');
      setCurrency(proposal.currency);
      setStatusId(proposal.status_id || '');
      setValidUntil(proposal.valid_until ? proposal.valid_until.split('T')[0] : '');
      setDiscountAmount(Number((proposal as any).discount_amount) || 0);
      setDiscountType(((proposal as any).discount_type === 'percent' ? 'percent' : 'fixed') as DiscountType);
      setPixKey((proposal as any).pix_key || '');
      setPixKeyType((((proposal as any).pix_key_type as PixKeyType) || 'cpf'));
    }
  }, [proposal, isEditing]);

  useEffect(() => {
    if (existingItems?.length && isEditing) {
      setItems(existingItems.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        total: Number(i.total),
        position: i.position,
      })));
    }
  }, [existingItems, isEditing]);

  useEffect(() => {
    if (!statusId && statuses?.length) {
      const def = statuses.find((s) => s.is_default);
      if (def) setStatusId(def.id);
    }
  }, [statuses, statusId]);

  const updateItem = (idx: number, field: keyof ProposalItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated[idx].total = Number(updated[idx].quantity) * Number(updated[idx].unit_price);
      }
      return updated;
    });
  };

  const applyProduct = (idx: number, product: Product) => {
    setItems((prev) => {
      const updated = [...prev];
      const price = Number(product.default_price) || 0;
      const qty = Number(updated[idx].quantity) || 1;
      updated[idx] = {
        ...updated[idx],
        description: [product.name, product.description].filter(Boolean).join(' — '),
        quantity: qty,
        unit_price: price,
        total: qty * price,
      };
      return updated;
    });
  };

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discountValueApplied = discountValue(subtotal, discountAmount, discountType);
  const grandTotal = applyDiscount(subtotal, discountAmount, discountType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPix = pixKey.trim();
    if (trimmedPix && !isValidPixKey(trimmedPix, pixKeyType)) {
      toast({ title: t('form.pix.invalid'), variant: 'destructive' });
      return;
    }
    const data = {
      title, description, notes, terms,
      client_id: clientId === 'none' ? null : clientId,
      currency, status_id: statusId || null,
      valid_until: validUntil || null,
      discount_amount: discountAmount,
      discount_type: discountType,
      pix_key: trimmedPix || null,
      pix_key_type: trimmedPix ? pixKeyType : null,
      items,
    };
    if (isEditing) {
      await update.mutateAsync({ ...data, id: id! });
    } else {
      await create.mutateAsync(data);
    }
    navigate('/proposals');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/proposals')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? t('form.editTitle') : t('form.newTitle')}
        </h1>
      </div>

      <UpgradeModal
        open={blocked}
        onOpenChange={(open) => {
          setBlocked(open);
          if (!open) navigate('/proposals');
        }}
      />

      {showPicker && (
        <Card>
          <CardHeader>
            <CardTitle>{t('templates.pickerTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('templates.pickerSubtitle')}</p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {PROPOSAL_TEMPLATE_IDS.map((tplId) => {
              const Icon = TEMPLATE_ICONS[tplId];
              return (
                <button
                  key={tplId}
                  type="button"
                  onClick={() => applyTemplate(tplId)}
                  className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent/40"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <span className="block font-medium">{t(`templates.options.${tplId}.title`)}</span>
                    <span className="block text-sm text-muted-foreground">
                      {t(`templates.options.${tplId}.description`)}
                    </span>
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPickerDismissed(true)}
              className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-left transition-colors hover:border-primary hover:bg-accent/40"
            >
              <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <span>
                <span className="block font-medium">{t('templates.blank.title')}</span>
                <span className="block text-sm text-muted-foreground">{t('templates.blank.description')}</span>
              </span>
            </button>
          </CardContent>
        </Card>
      )}

      {!isEditing && appliedTemplate && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-4 py-2">
          <p className="text-sm text-muted-foreground">
            {t('templates.applied', { name: t(`templates.options.${appliedTemplate}.title`) })}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setAppliedTemplate(null); setPickerDismissed(false); }}
          >
            {t('templates.change')}
          </Button>
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>{t('form.details')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">{t('form.title')} *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">{t('form.description')}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('form.client')}</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder={t('form.selectClient')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('form.noClient')}</SelectItem>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('form.status')}</Label>
                <Select value={statusId} onValueChange={setStatusId}>
                  <SelectTrigger><SelectValue placeholder={t('form.selectStatus')} /></SelectTrigger>
                  <SelectContent>
                    {statuses?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('form.currency')}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['BRL', 'USD', 'EUR', 'GBP'].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valid_until">{t('form.validUntil')}</Label>
                <Input id="valid_until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                <p className="mt-1 text-xs text-muted-foreground">{t('form.validUntilHint')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('form.items')}</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" /> {t('form.addItem')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                <div className="sm:col-span-5">
                  {idx === 0 && <Label className="text-xs">{t('form.itemDescription')}</Label>}
                  <div className="flex gap-2">
                    <ProductPicker currency={currency} onSelect={(p) => applyProduct(idx, p)} />
                    <Input placeholder={t('form.itemDescriptionPlaceholder')} value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:col-span-6 gap-2">
                  <div>
                    {idx === 0 && <Label className="text-xs">{t('form.qty')}</Label>}
                    <Input type="number" min="0" step="any" value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                  </div>
                  <div>
                    {idx === 0 && <Label className="text-xs">{t('form.unitPrice')}</Label>}
                    <Input type="number" min="0" step="0.01" value={item.unit_price}
                      onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))} />
                  </div>
                  <div>
                    {idx === 0 && <Label className="text-xs">{t('form.itemTotal')}</Label>}
                    <Input value={formatCurrency(item.total, currency)} readOnly className="bg-muted" />
                  </div>
                </div>
                <div className="sm:col-span-1 flex justify-end sm:justify-start">
                  <Button type="button" variant="ghost" size="icon"
                    onClick={() => removeItem(idx)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-end gap-3 sm:gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">{t('form.discount')}:</Label>
                  <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
                    <SelectTrigger className="w-[110px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">{t('form.discountFixed')}</SelectItem>
                      <SelectItem value="percent">{t('form.discountPercent')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step={discountType === 'percent' ? '0.1' : '0.01'}
                    max={discountType === 'percent' ? 100 : undefined}
                    value={discountAmount || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDiscountAmount(v === '' ? 0 : Math.max(Number(v) || 0, 0));
                    }}
                    placeholder="0"
                    className="w-[100px] h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <div className="text-right space-y-1 min-w-[220px]">
                  <div className="flex justify-between gap-8 text-sm">
                    <span className="text-muted-foreground">{t('form.subtotal')}</span>
                    <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  {discountValueApplied > 0 && (
                    <div className="flex justify-between gap-8 text-sm">
                      <span className="text-muted-foreground">
                        {t('form.discount')}
                        {discountType === 'percent' ? ` (${discountAmount}%)` : ''}
                      </span>
                      <span className="tabular-nums text-destructive">
                        −{formatCurrency(discountValueApplied, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-8 pt-1 border-t">
                    <span className="text-sm text-muted-foreground">{t('form.grandTotal')}</span>
                    <span className="text-2xl font-bold tabular-nums">{formatCurrency(grandTotal, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('form.notesAndTerms')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">{t('form.notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder={t('form.notesPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="terms">{t('form.terms')}</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={5}
                placeholder={t('form.termsPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader><CardTitle>{t('form.pix.title')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('form.pix.hint')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>{t('form.pix.keyType')}</Label>
                <Select value={pixKeyType} onValueChange={(v) => setPixKeyType(v as PixKeyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PIX_KEY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{t(`form.pix.types.${type}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pix_key">{t('form.pix.key')}</Label>
                <Input
                  id="pix_key"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder={t('form.pix.keyPlaceholder')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/proposals')}>{t('common:actions.cancel')}</Button>
          <Button type="submit" disabled={create.isPending || update.isPending}>
            {isEditing ? t('form.submitEdit') : t('form.submitNew')}
          </Button>
        </div>
      </form>
    </div>
  );
}
