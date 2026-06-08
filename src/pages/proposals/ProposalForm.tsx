import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
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
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { UpgradeModal } from '@/components/UpgradeModal';
import { formatCurrency } from '@/lib/format';

const emptyItem = (): ProposalItem => ({
  description: '', quantity: 1, unit_price: 0, total: 0, position: 0,
});

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
  const limits = usePlanLimits();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!isEditing && !limits.canCreateProposal) {
      setBlocked(true);
    }
  }, [isEditing, limits.canCreateProposal]);


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [clientId, setClientId] = useState<string>('none');
  const [currency, setCurrency] = useState('BRL');
  const [statusId, setStatusId] = useState<string>('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<ProposalItem[]>([emptyItem()]);

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

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  const grandTotal = items.reduce((s, i) => s + i.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title, description, notes, terms,
      client_id: clientId === 'none' ? null : clientId,
      currency, status_id: statusId || null,
      valid_until: validUntil || null,
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
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  {idx === 0 && <Label className="text-xs">{t('form.itemDescription')}</Label>}
                  <Input placeholder={t('form.itemDescriptionPlaceholder')} value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <Label className="text-xs">{t('form.qty')}</Label>}
                  <Input type="number" min="0" step="any" value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <Label className="text-xs">{t('form.unitPrice')}</Label>}
                  <Input type="number" min="0" step="0.01" value={item.unit_price}
                    onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <Label className="text-xs">{t('form.itemTotal')}</Label>}
                  <Input value={formatCurrency(item.total, currency)} readOnly className="bg-muted" />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon"
                    onClick={() => removeItem(idx)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('form.grandTotal')}</p>
                <p className="text-2xl font-bold">{formatCurrency(grandTotal, currency)}</p>
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
