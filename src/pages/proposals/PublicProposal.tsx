import { useParams } from 'react-router-dom';
import { CheckCircle, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { usePublicProposal, useProposalStatuses } from '@/hooks/useProposals';
import { formatCurrency, formatDate } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function PublicProposal() {
  const { publicCode } = useParams();
  const { data: proposal, isLoading, refetch } = usePublicProposal(publicCode);
  const { data: statuses } = useProposalStatuses();
  const [accepting, setAccepting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading proposal...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Proposal not found</h1>
          <p className="text-muted-foreground">This link may be invalid or the proposal may have been removed.</p>
        </div>
      </div>
    );
  }

  const isApproved = proposal.proposal_statuses?.name === 'Approved';
  const isRejected = proposal.proposal_statuses?.name === 'Rejected';
  const isFinal = isApproved || isRejected;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const approvedStatus = statuses?.find((s) => s.name === 'Approved');
      if (!approvedStatus) throw new Error('Status not found');

      const { error } = await supabase
        .from('proposals')
        .update({ status_id: approvedStatus.id })
        .eq('public_code', publicCode!);
      if (error) throw error;

      await supabase.from('proposal_status_history').insert({
        proposal_id: proposal.id,
        status_id: approvedStatus.id,
        notes: 'Accepted by client via public link',
      });

      toast({ title: 'Proposal accepted!' });
      refetch();
    } catch {
      toast({ title: 'Error accepting proposal', variant: 'destructive' });
    } finally {
      setAccepting(false);
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Regarding proposal: ${proposal.title}`)}`;

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
                Prepared for {proposal.clients.name}
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
            Valid until {formatDate(proposal.valid_until)}
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
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
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
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{formatCurrency(Number(proposal.total_amount), proposal.currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center pt-4">
          {!isFinal && (
            <Button size="lg" onClick={handleAccept} disabled={accepting}>
              <CheckCircle className="mr-2 h-5 w-5" />
              Accept Proposal
            </Button>
          )}
          {isApproved && (
            <div className="text-center">
              <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                <CheckCircle className="mr-2 h-5 w-5" /> Proposal Accepted
              </Badge>
            </div>
          )}
          <Button size="lg" variant="outline" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Contact via WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
