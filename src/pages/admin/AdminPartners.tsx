import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['prospectado', 'contatado', 'negociando', 'ativo', 'recusado'] as const;
type PartnerStatus = (typeof STATUSES)[number];

const statusClass: Record<PartnerStatus, string> = {
  prospectado: 'bg-muted text-muted-foreground',
  contatado: 'bg-secondary text-secondary-foreground',
  negociando: 'bg-accent text-accent-foreground',
  ativo: 'bg-primary text-primary-foreground',
  recusado: 'bg-destructive/10 text-destructive',
};

interface Partner {
  id: string;
  name: string;
  contact: string | null;
  status: PartnerStatus;
  coupon_code: string | null;
  discount_percent: number | null;
  discount_duration: string | null;
  repasse_rule: string | null;
  last_contact_at: string | null;
  notes: string | null;
  is_active: boolean | null;
}

type Draft = {
  id?: string;
  name: string;
  contact: string;
  status: PartnerStatus;
  coupon_code: string;
  discount_percent: string;
  discount_duration: string;
  repasse_rule: string;
  last_contact_at: string;
  notes: string;
};

const emptyDraft = (): Draft => ({
  name: '',
  contact: '',
  status: 'prospectado',
  coupon_code: '',
  discount_percent: '',
  discount_duration: '',
  repasse_rule: '',
  last_contact_at: '',
  notes: '',
});

const toDraft = (p: Partner): Draft => ({
  id: p.id,
  name: p.name,
  contact: p.contact ?? '',
  status: p.status,
  coupon_code: p.coupon_code ?? '',
  discount_percent: p.discount_percent != null ? String(p.discount_percent) : '',
  discount_duration: p.discount_duration ?? '',
  repasse_rule: p.repasse_rule ?? '',
  last_contact_at: p.last_contact_at ? p.last_contact_at.slice(0, 10) : '',
  notes: p.notes ?? '',
});

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—');

export default function AdminPartners() {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin_partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_partners')
        .select('*')
        .order('status', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Partner[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name.trim(),
        contact: d.contact.trim() || null,
        status: d.status,
        coupon_code: d.coupon_code.trim() || null,
        discount_percent: d.discount_percent ? Number(d.discount_percent) : null,
        discount_duration: d.discount_duration.trim() || null,
        repasse_rule: d.repasse_rule.trim() || null,
        last_contact_at: d.last_contact_at ? new Date(d.last_contact_at).toISOString() : null,
        notes: d.notes.trim() || null,
        is_active: d.status === 'ativo',
      };
      const { error } = d.id
        ? await supabase.from('referral_partners').update(payload).eq('id', d.id)
        : await supabase.from('referral_partners').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_partners'] });
      setDraft(null);
      toast.success(t('partners.saved'));
    },
    onError: () => toast.error(t('partners.error')),
  });

  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PartnerStatus }) => {
      const { error } = await supabase
        .from('referral_partners')
        .update({ status, is_active: status === 'ativo' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_partners'] });
      toast.success(t('partners.saved'));
    },
    onError: () => toast.error(t('partners.error')),
  });

  if (isLoading) return <p className="text-muted-foreground">{t('partners.loading')}</p>;

  const partners = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{t('partners.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('partners.subtitle')}</p>
        </div>
        <Button onClick={() => setDraft(emptyDraft())}>
          <Plus className="mr-2 h-4 w-4" />
          {t('partners.new')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('partners.columns.name')}</TableHead>
                <TableHead>{t('partners.columns.contact')}</TableHead>
                <TableHead>{t('partners.columns.status')}</TableHead>
                <TableHead>{t('partners.columns.coupon')}</TableHead>
                <TableHead>{t('partners.columns.commission')}</TableHead>
                <TableHead>{t('partners.columns.lastContact')}</TableHead>
                <TableHead>{t('partners.columns.notes')}</TableHead>
                <TableHead className="text-right">{t('partners.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {t('partners.empty')}
                  </TableCell>
                </TableRow>
              )}
              {partners.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.contact || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={statusClass[p.status] ?? ''} variant="secondary">
                        {t(`partners.status.${p.status}`)}
                      </Badge>
                      <Select
                        value={p.status}
                        onValueChange={(v) => changeStatus.mutate({ id: p.id, status: v as PartnerStatus })}
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{t(`partners.status.${s}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.coupon_code ? (
                      <span className="font-mono text-xs">{p.coupon_code}</span>
                    ) : '—'}
                    {p.discount_percent != null && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({p.discount_percent}%{p.discount_duration ? ` · ${p.discount_duration}` : ''})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[240px] text-xs text-muted-foreground">
                    <span className="line-clamp-2">{p.repasse_rule || '—'}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {fmt(p.last_contact_at)}
                  </TableCell>
                  <TableCell className="max-w-[240px] text-xs text-muted-foreground">
                    <span className="line-clamp-2">{p.notes || '—'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDraft(toDraft(p))}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? t('partners.editTitle') : t('partners.newTitle')}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>{t('partners.form.name')}</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('partners.form.contact')}</Label>
                <Input value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('partners.form.status')}</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as PartnerStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{t(`partners.status.${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {draft.id && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>{t('partners.form.coupon')}</Label>
                    <Input value={draft.coupon_code} onChange={(e) => setDraft({ ...draft, coupon_code: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('partners.form.discountPercent')}</Label>
                    <Input
                      type="number"
                      value={draft.discount_percent}
                      onChange={(e) => setDraft({ ...draft, discount_percent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('partners.form.discountDuration')}</Label>
                    <Input value={draft.discount_duration} onChange={(e) => setDraft({ ...draft, discount_duration: e.target.value })} />
                  </div>
                </div>
              )}
              {draft.id && (
                <div className="space-y-1.5">
                  <Label>{t('partners.form.commission')}</Label>
                  <Textarea
                    rows={3}
                    value={draft.repasse_rule}
                    onChange={(e) => setDraft({ ...draft, repasse_rule: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>{t('partners.form.lastContact')}</Label>
                <Input
                  type="date"
                  value={draft.last_contact_at}
                  onChange={(e) => setDraft({ ...draft, last_contact_at: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('partners.form.notes')}</Label>
                <Textarea rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>{t('partners.form.cancel')}</Button>
            <Button
              disabled={!draft?.name.trim() || save.isPending}
              onClick={() => draft && save.mutate(draft)}
            >
              {t('partners.form.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
