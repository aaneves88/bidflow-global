import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Pencil, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useProposal,
  useProposalItems,
  useProposalStatuses,
  useProposalStatusHistory,
  useUpdateProposalStatus,
} from '@/hooks/useProposals';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

export default function ProposalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: proposal, isLoading } = useProposal(id);
  const { data: items } = useProposalItems(id);
  const { data: statuses } = useProposalStatuses();
  const { data: history } = useProposalStatusHistory(id);
  const updateStatus = useUpdateProposalStatus();

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!proposal) return <p className="text-muted-foreground">Proposal not found</p>;

  const publicUrl = `${window.location.origin}/p/${proposal.public_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({ title: 'Link copied!' });
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this proposal: ${publicUrl}`)}`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/proposals')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{proposal.title}</h1>
          {proposal.clients && (
            <p className="text-muted-foreground">{proposal.clients.name} {proposal.clients.company ? `· ${proposal.clients.company}` : ''}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={copyLink} title="Copy public link">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" title="Send via WhatsApp">
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" onClick={() => navigate(`/proposals/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
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
            <SelectValue placeholder="Change status" />
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
          <span className="text-sm text-muted-foreground">Valid until {formatDate(proposal.valid_until)}</span>
        )}
      </div>

      {proposal.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap">{proposal.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
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
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold">{formatCurrency(Number(proposal.total_amount), proposal.currency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {history && history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full mt-2" style={{ backgroundColor: h.proposal_statuses?.color || '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium">{h.proposal_statuses?.name || 'Unknown'}</p>
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
