import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Eye, Pencil, Trash2, Copy, Files } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProposals, useDeleteProposal, useDuplicateProposal } from '@/hooks/useProposals';
import { usePublicAppUrl, buildPublicProposalUrl } from '@/hooks/usePublicAppUrl';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { formatCurrency, formatDate } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { UsageIndicator } from '@/components/UsageIndicator';
import { UpgradeModal } from '@/components/UpgradeModal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Proposals() {
  const { t } = useTranslation(['proposals', 'common', 'dashboard']);
  const { data: proposals, isLoading } = useProposals();
  const deleteProposal = useDeleteProposal();
  const duplicate = useDuplicateProposal();
  const limits = usePlanLimits();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const filtered = proposals?.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.clients?.name?.toLowerCase().includes(q) ||
      p.proposal_statuses?.name?.toLowerCase().includes(q)
    );
  });

  const copyPublicLink = (code: string) => {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: t('messages.linkCopied') });
  };

  const handleNew = () => {
    if (!limits.canCreateProposal) {
      setShowUpgrade(true);
      return;
    }
    navigate('/proposals/new');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> {t('newButton')}
        </Button>
      </div>

      <UsageIndicator variant="banner" />


      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common:actions.loading')}</p>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-muted-foreground mb-4">
            {search ? t('empty.noResults') : t('empty.none')}
          </p>
          {!search && (
            <Button variant="outline" onClick={handleNew}>
              <Plus className="mr-2 h-4 w-4" /> {t('empty.createFirst')}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.title')}</TableHead>
                <TableHead>{t('table.client')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead className="text-right">{t('table.total')}</TableHead>
                <TableHead>{t('table.date')}</TableHead>
                <TableHead className="w-[140px]">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.clients?.name || '—'}</TableCell>
                  <TableCell>
                    {p.proposal_statuses ? (
                      <Badge
                        variant="outline"
                        style={{ borderColor: p.proposal_statuses.color, color: p.proposal_statuses.color }}
                      >
                        {p.proposal_statuses.name}
                      </Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(p.total_amount), p.currency)}</TableCell>
                  <TableCell>{formatDate(p.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/proposals/${p.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/proposals/${p.id}/edit`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => copyPublicLink(p.public_code)} title={t('view.copyLink')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t('actions.duplicate')}
                        onClick={() => {
                          if (!limits.canCreateProposal) { setShowUpgrade(true); return; }
                          duplicate.mutate(p.id);
                        }}
                      >
                        <Files className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deletingId) deleteProposal.mutate(deletingId); setDeletingId(null); }}
            >
              {t('common:actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}
