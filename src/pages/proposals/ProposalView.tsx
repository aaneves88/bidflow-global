import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Pencil, MessageCircle, Eye, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useProposal, useProposalItems, useProposalStatuses,
  useProposalStatusHistory, useUpdateProposalStatus,
} from '@/hooks/useProposals';
import { useProposalViews } from '@/hooks/useProposalViews';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useBranding } from '@/hooks/useBranding';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { generateProposalPdf } from '@/lib/proposalPdf';
import { toast } from '@/hooks/use-toast';


function buildWhatsAppUrl(phone: string | null | undefined, message: string) {
  const digits = (phone || '').replace(/\D/g, '');
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

export default function ProposalView() {
  const { t } = useTranslation(['proposals', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: proposal, isLoading } = useProposal(id);
  const { data: items } = useProposalItems(id);
  const { data: statuses } = useProposalStatuses();
  const { data: history } = useProposalStatusHistory(id);
  const { data: views } = useProposalViews(id);
  const { getSetting } = useAppSettings('general');
  const updateStatus = useUpdateProposalStatus();

  if (isLoading) return <p className="text-muted-foreground">{t('common:actions.loading')}</p>;
  if (!proposal) return <p className="text-muted-foreground">{t('view.notFound')}</p>;

  const publicUrl = `${window.location.origin}/p/${proposal.public_code}`;
  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({ title: t('messages.linkCopied') });
  };

  const clientName = proposal.clients?.name || '';
  const totalFmt = formatCurrency(Number(proposal.total_amount), proposal.currency);
  const whatsappMessage = t('share.whatsappMessage', {
    clientName: clientName || t('share.defaultClient'),
    title: proposal.title,
    total: totalFmt,
    url: publicUrl,
  });
  const whatsappUrl = buildWhatsAppUrl(proposal.clients?.phone, whatsappMessage);

  const handlePdf = () => {
    if (!items) return;
    const companyName = (getSetting('company_name') as string) || undefined;
    generateProposalPdf(proposal as any, items as any[], {
      companyName,
      publicUrlBase: window.location.origin,
      labels: {
        proposalFor: t('pdf.proposalFor'),
        description: t('pdf.description'),
        items: t('pdf.items'),
        qty: t('pdf.qty'),
        unitPrice: t('pdf.unitPrice'),
        total: t('pdf.total'),
        grandTotal: t('pdf.grandTotal'),
        validUntil: t('pdf.validUntil'),
        status: t('pdf.status'),
        publicLink: t('pdf.publicLink'),
        generatedAt: t('pdf.generatedAt'),
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/proposals')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">{proposal.title}</h1>
          {proposal.clients && (
            <p className="text-muted-foreground truncate">{proposal.clients.name} {proposal.clients.company ? `· ${proposal.clients.company}` : ''}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/proposals/${id}/edit`)}>
          <Pencil className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t('view.edit')}</span>
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Button variant="outline" onClick={copyLink}>
          <Copy className="mr-2 h-4 w-4" />
          {t('view.copyLink')}
        </Button>
        <Button variant="outline" asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            {t('view.sendWhatsapp')}
          </a>
        </Button>
        <Button variant="outline" onClick={handlePdf} disabled={!items}>
          <FileDown className="mr-2 h-4 w-4" />
          {t('view.downloadPdf')}
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {proposal.proposal_statuses && (
          <Badge variant="outline" style={{ borderColor: proposal.proposal_statuses.color, color: proposal.proposal_statuses.color }}>
            {proposal.proposal_statuses.name}
          </Badge>
        )}
        <Select
          value={proposal.status_id || ''}
          onValueChange={(val) => updateStatus.mutate({ id: proposal.id, status_id: val })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('view.changeStatus')} />
          </SelectTrigger>
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
        {proposal.valid_until && (
          <span className="text-sm text-muted-foreground">{t('view.validUntil', { date: formatDate(proposal.valid_until) })}</span>
        )}
        <Badge variant="secondary" className="ml-auto">
          <Eye className="mr-1 h-3 w-3" />
          {views ? t('view.viewsCount', { count: views.count }) : t('view.viewsCount', { count: 0 })}
        </Badge>
      </div>

      {proposal.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap">{proposal.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{t('view.items')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('form.itemDescription')}</TableHead>
                <TableHead className="text-right">{t('form.qty')}</TableHead>
                <TableHead className="text-right">{t('form.unitPrice')}</TableHead>
                <TableHead className="text-right">{t('form.itemTotal')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.unit_price), proposal.currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.total), proposal.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end pt-4 border-t mt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('form.grandTotal')}</p>
              <p className="text-2xl font-bold">{totalFmt}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {views && (
        <Card>
          <CardHeader><CardTitle>{t('view.viewsTitle')}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {views.count === 0 ? (
              <p className="text-muted-foreground">{t('view.neverViewed')}</p>
            ) : (
              <>
                <p>{t('view.viewsCount', { count: views.count })}</p>
                {views.firstView && <p className="text-muted-foreground">{t('view.firstView', { date: formatDateTime(views.firstView) })}</p>}
                {views.lastView && views.lastView !== views.firstView && (
                  <p className="text-muted-foreground">{t('view.lastView', { date: formatDateTime(views.lastView) })}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {history && history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t('view.history')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full mt-2" style={{ backgroundColor: h.proposal_statuses?.color || '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium">{h.proposal_statuses?.name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
                    {h.notes && <p className="text-sm text-muted-foreground mt-1">{h.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
