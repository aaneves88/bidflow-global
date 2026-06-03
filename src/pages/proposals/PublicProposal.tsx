import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, MessageCircle, Clock, FileDown, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { usePublicProposal } from '@/hooks/useProposals';
import { useRecordProposalView } from '@/hooks/useProposalViews';
import { fetchPublicBranding } from '@/hooks/useBranding';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { generateProposalPdf } from '@/lib/proposalPdf';
import { toast } from '@/hooks/use-toast';
import { SignatureDialog } from '@/components/SignatureDialog';
import { LegalFooter } from '@/components/LegalFooter';

export default function PublicProposal() {
  const { t } = useTranslation(['public', 'common']);
  const { publicCode } = useParams();
  const { data: proposal, isLoading, refetch } = usePublicProposal(publicCode);
  const recordView = useRecordProposalView();
  const [signatureOpen, setSignatureOpen] = useState(false);

  const { data: branding } = useQuery({
    queryKey: ['public-branding'],
    queryFn: () => fetchPublicBranding(supabase),
    staleTime: 5 * 60 * 1000,
  });

  const { data: signature, refetch: refetchSig } = useQuery({
    queryKey: ['public-signature', publicCode],
    enabled: !!publicCode,
    queryFn: async () => {
      const { data } = await supabase.rpc('get_proposal_signature', { p_code: publicCode! });
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    },
  });

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

  const primary = branding?.primaryColor || '#3B82F6';
  const secondary = branding?.secondaryColor || '#1F2937';
  const accent = branding?.accentColor || '#22C55E';

  const handleSigned = () => {
    refetch();
    refetchSig();
    toast({ title: t('messages.accepted') });
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(t('share.whatsappText', { title: proposal.title }))}`;
  const items = (proposal as any).proposal_items || [];
  const sortedItems = [...items].sort((a: any, b: any) => a.position - b.position);

  return (
    <div className="min-h-screen bg-background">
      {/* Brand top bar */}
      <div className="h-2 w-full" style={{ backgroundColor: primary }} />

      {/* Brand header */}
      {(branding?.logoUrl || branding?.companyName) && (
        <div className="border-b">
          <div className="max-w-3xl mx-auto p-4 sm:px-10 flex items-center gap-3">
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="" className="h-10 w-auto object-contain" />
            )}
            {branding.companyName && (
              <span className="font-semibold" style={{ color: secondary }}>
                {branding.companyName}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto p-6 sm:p-10 space-y-6">
        <div className="flex items-start justify-between gap-4">
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
                <p className="text-3xl font-bold" style={{ color: accent }}>
                  {formatCurrency(Number(proposal.total_amount), proposal.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center pt-4 flex-wrap">
          {!isFinal && (
            <Button
              size="lg"
              onClick={() => setSignatureOpen(true)}
              style={{ backgroundColor: primary, color: '#fff' }}
              className="hover:opacity-90"
            >
              <PenLine className="mr-2 h-5 w-5" />
              {t('actions.signAndAccept')}
            </Button>
          )}
          {isApproved && (
            <Badge className="text-base px-4 py-2" style={{ backgroundColor: accent, color: '#fff' }}>
              <CheckCircle className="mr-2 h-5 w-5" /> {t('accepted')}
            </Badge>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={() => generateProposalPdf(proposal as any, sortedItems as any[], {
              publicUrlBase: window.location.origin,
              companyName: branding?.companyName,
              logoDataUrl: branding?.logoUrl,
              primaryColor: primary,
              secondaryColor: secondary,
              accentColor: accent,
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

        {signature && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: accent }} />
                {t('signature.signed')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-2xl mb-2 border-b border-dashed pb-2"
                style={{ fontFamily: '"Brush Script MT", cursive', color: primary }}
              >
                {signature.signer_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('signature.signedOn', { date: formatDateTime(signature.signed_at) })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Branded footer */}
        {branding?.companyName && (
          <div className="pt-8 mt-8 border-t text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              {t('preparedFor', { name: '' }).replace('{{name}}', '').trim() || 'Sent by'}{' '}
              <span style={{ color: secondary }} className="font-medium">{branding.companyName}</span>
            </p>
            <LegalFooter variant="compact" />
          </div>
        )}
      </div>

      <SignatureDialog
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
        publicCode={publicCode!}
        defaultEmail={proposal.clients?.email || undefined}
        primaryColor={primary}
        onSigned={handleSigned}
      />
    </div>
  );
}
