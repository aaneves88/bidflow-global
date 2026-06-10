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
import { fetchPublicBranding, ORCA_BRANDING } from '@/hooks/useBranding';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { generateProposalPdf } from '@/lib/proposalPdf';
import { toast } from '@/hooks/use-toast';
import { SignatureDialog } from '@/components/SignatureDialog';
import { LegalFooter } from '@/components/LegalFooter';
import orcaMark from '@/assets/brand/orca-mark.png';

export default function PublicProposal() {
  const { t } = useTranslation(['public', 'common']);
  const { publicCode } = useParams();
  const { data: proposal, isLoading, refetch } = usePublicProposal(publicCode);
  const recordView = useRecordProposalView();
  const [signatureOpen, setSignatureOpen] = useState(false);

  const { data: branding } = useQuery({
    queryKey: ['public-branding', publicCode],
    enabled: !!publicCode,
    queryFn: () => fetchPublicBranding(supabase, publicCode),
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
    if (proposal?.id && publicCode) {
      const viewKey = `cf_view_${proposal.id}`;
      const alreadyViewed = !!sessionStorage.getItem(viewKey);
      recordView.mutate(proposal.id);
      // Only notify owner the first time per session (matches view dedup)
      if (!alreadyViewed) {
        supabase.functions.invoke('notify-proposal-event', {
          body: { publicCode, event: 'viewed' },
        }).catch((e) => console.warn('notify viewed failed', e));
      }
    }
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

  const isFreeOwner = !branding?.hasActivePlan;
  const primary = branding?.primaryColor || ORCA_BRANDING.primaryColor;
  const secondary = branding?.secondaryColor || ORCA_BRANDING.secondaryColor;
  const accent = branding?.accentColor || ORCA_BRANDING.accentColor;

  const handleSigned = (signerName?: string) => {
    refetch();
    refetchSig();
    toast({ title: t('messages.accepted') });
    if (publicCode) {
      // Fire signed + accepted (sign_proposal also moves to approved status)
      supabase.functions.invoke('notify-proposal-event', {
        body: { publicCode, event: 'signed', signerName },
      }).catch((e) => console.warn('notify signed failed', e));
    }
  };


  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(t('share.whatsappText', { title: proposal.title }))}`;
  const items = (proposal as any).proposal_items || [];
  const sortedItems = [...items].sort((a: any, b: any) => a.position - b.position);
  const notes = (proposal as any).notes as string | null;
  const terms = (proposal as any).terms as string | null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Brand top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: primary }} />

      {/* Brand header */}
      {isFreeOwner ? (
        <div className="bg-background border-b">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-5 flex items-center gap-3">
            <img src={orcaMark} alt="Orca" className="h-9 w-auto object-contain" />
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight" style={{ color: secondary }}>
                Orca
              </p>
              <p className="text-xs text-muted-foreground">{t('freeOwner.tagline')}</p>
            </div>
          </div>
        </div>
      ) : (branding?.logoUrl || branding?.companyName) ? (
        <div className="bg-background border-b">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-5 flex items-center gap-4">
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="" className="h-12 w-auto object-contain" />
            )}
            {branding.companyName && (
              <span className="text-lg font-semibold tracking-tight" style={{ color: secondary }}>
                {branding.companyName}
              </span>
            )}
          </div>
        </div>
      ) : null}

      <div className="max-w-3xl mx-auto px-4 sm:px-10 py-8 sm:py-12 space-y-6">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              {proposal.title}
            </h1>
            {proposal.valid_until && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                <Clock className="h-4 w-4" />
                {t('validUntil', { date: formatDate(proposal.valid_until) })}
              </div>
            )}
          </div>
          {proposal.proposal_statuses && (
            <Badge
              variant="outline"
              className="text-sm shrink-0"
              style={{ borderColor: proposal.proposal_statuses.color, color: proposal.proposal_statuses.color }}
            >
              {proposal.proposal_statuses.name}
            </Badge>
          )}
        </div>

        {proposal.clients && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {t('client')}
              </p>
              <p className="font-medium text-base">{proposal.clients.name}</p>
              {proposal.clients.company && (
                <p className="text-sm text-muted-foreground">{proposal.clients.company}</p>
              )}
              {proposal.clients.email && (
                <p className="text-sm text-muted-foreground">{proposal.clients.email}</p>
              )}
            </CardContent>
          </Card>
        )}

        {proposal.description && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {proposal.description}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>{t('items')}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">{t('table.description')}</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">{t('table.qty')}</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">{t('table.unitPrice')}</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">{t('table.total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(Number(item.unit_price), proposal.currency)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{formatCurrency(Number(item.total), proposal.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end pt-6">
              <div
                className="rounded-lg px-6 py-4 text-center"
                style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}40` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: accent }}
                >
                  {t('totalLabel')}
                </p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: accent }}>
                  {formatCurrency(Number(proposal.total_amount), proposal.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {notes}
              </p>
            </CardContent>
          </Card>
        )}

        {terms && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('terms')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {terms}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-center pt-2 flex-wrap">
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
              companyName: isFreeOwner ? 'Orca' : branding?.companyName,
              logoDataUrl: isFreeOwner ? undefined : branding?.logoUrl,
              primaryColor: primary,
              secondaryColor: secondary,
              accentColor: accent,
              watermark: isFreeOwner,
              showPoweredBy: true,
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

        {/* Footer: branded for paid, watermarked for free */}
        <div className="pt-8 mt-8 border-t text-center space-y-3">
          {!isFreeOwner && branding?.companyName && (
            <p className="text-xs text-muted-foreground">
              <span style={{ color: secondary }} className="font-medium">{branding.companyName}</span>
            </p>
          )}
          <a
            href="https://orca-mento.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors ${isFreeOwner ? 'text-sm' : 'text-[11px]'}`}
          >
            <img src={orcaMark} alt="" className={isFreeOwner ? 'h-4 w-auto' : 'h-3 w-auto'} />
            <span>{isFreeOwner ? t('freeOwner.poweredBy') : t('poweredBy')}</span>
          </a>
          <LegalFooter variant="compact" />
        </div>
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
