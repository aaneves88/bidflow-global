import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, MessageCircle, Clock, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { usePublicProposal } from '@/hooks/useProposals';
import { useRecordProposalView } from '@/hooks/useProposalViews';
import { formatCurrency, formatDate } from '@/lib/format';
import { generateProposalPdf } from '@/lib/proposalPdf';
import { toast } from '@/hooks/use-toast';

export default function PublicProposal() {
  const { t } = useTranslation(['public', 'common']);
  const { publicCode } = useParams();
  const { data: proposal, isLoading, refetch } = usePublicProposal(publicCode);
  const recordView = useRecordProposalView();
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (proposal?.id) recordView.mutate(proposal.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t('notFound.title')}</h1>
          <p className="text-muted-foreground">{t('notFound.description')}</p>
        </div>
      </div>
    );
  }

  const statusName = proposal.proposal_statuses?.name || '';
  const isApproved = /aprov|approv/i.test(statusName);
  const isRejected = /reject|rejeit|perdid|lost/i.test(statusName);
  const isFinal = isApproved || isRejected;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { error } = await supabase.rpc('accept_proposal', { p_code: publicCode! });
      if (error) throw error;
      toast({ title: t('messages.accepted') });
      refetch();
    } catch {
      toast({ title: t('messages.errorAccepting'), variant: 'destructive' });
    } finally {
      setAccepting(false);
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(t('share.whatsappText', { title: proposal.title }))}`;

  const items = (proposal as any).proposal_items || [];
  const sortedItems = [...items].sort((a: any, b: any) => a.position - b.position);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 sm:p-10 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{proposal.title}</h1>
            {proposal.clients && (
              <p className="text-muted-foreground mt-1">
                {t('preparedFor', { name: proposal.clients.name })}
                {proposal.clients.company ? ` · ${proposal.clients.company}` : ''}
              </p>
            )}
          </div>
          {proposal.proposal_statuses && (
            <Badge
              variant="outline"
              className="text-sm"
              style={{ borderColor: proposal.proposal_statuses.color, color: proposal.proposal_statuses.color }}
            >
              {proposal.proposal_statuses.name}
            </Badge>
          )}
        </div>

        {proposal.valid_until && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {t('validUntil', { date: formatDate(proposal.valid_until) })}
          </div>
        )}

        {proposal.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap">{proposal.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>{t('items')}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.description')}</TableHead>
                  <TableHead className="text-right">{t('table.qty')}</TableHead>
                  <TableHead className="text-right">{t('table.unitPrice')}</TableHead>
                  <TableHead className="text-right">{t('table.total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item: any) => (
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
                <p className="text-sm text-muted-foreground">{t('totalLabel')}</p>
                <p className="text-3xl font-bold">{formatCurrency(Number(proposal.total_amount), proposal.currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center pt-4 flex-wrap">
          {!isFinal && (
            <Button size="lg" onClick={handleAccept} disabled={accepting}>
              <CheckCircle className="mr-2 h-5 w-5" />
              {t('actions.accept')}
            </Button>
          )}
          {isApproved && (
            <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
              <CheckCircle className="mr-2 h-5 w-5" /> {t('accepted')}
            </Badge>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={() => generateProposalPdf(proposal as any, sortedItems as any[], {
              publicUrlBase: window.location.origin,
            })}
          >
            <FileDown className="mr-2 h-5 w-5" />
            {t('actions.downloadPdf')}
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              {t('actions.whatsapp')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
