import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useClientsWithProposalCount, useDeleteClient } from '@/hooks/useClients';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { ClientDialog } from '@/pages/clients/ClientDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Clients() {
  const { t } = useTranslation(['clients', 'common', 'dashboard']);
  const { data: clients, isLoading } = useClientsWithProposalCount();
  const deleteClient = useDeleteClient();
  const limits = usePlanLimits();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = clients?.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  const newButton = (
    <Button onClick={() => { setEditingClient(null); setDialogOpen(true); }} disabled={!limits.canCreateClient}>
      <Plus className="mr-2 h-4 w-4" /> {t('newButton')}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        {!limits.canCreateClient ? (
          <Tooltip>
            <TooltipTrigger asChild><span>{newButton}</span></TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2">
                <p>{t('dashboard:limit.clientsReached')}</p>
                <Button size="sm" asChild><Link to="/pricing">{t('dashboard:limit.upgrade')}</Link></Button>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : newButton}
      </div>

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
          {!search && limits.canCreateClient && (
            <Button variant="outline" onClick={() => { setEditingClient(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> {t('empty.addFirst')}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.email')}</TableHead>
                <TableHead>{t('table.company')}</TableHead>
                <TableHead>{t('table.phone')}</TableHead>
                <TableHead>{t('table.proposals')}</TableHead>
                <TableHead className="w-[100px]">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell>
                    {client.logo_url ? (
                      <img src={client.logo_url} alt="" className="h-8 w-8 rounded object-contain bg-muted" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {client.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email || '—'}</TableCell>
                  <TableCell>{client.company || '—'}</TableCell>
                  <TableCell>{client.phone || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{client.proposal_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingClient(client); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(client.id)}>
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

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deletingId) deleteClient.mutate(deletingId); setDeletingId(null); }}
            >
              {t('common:actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
