import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSnippets, useDeleteSnippet, useCreateSnippet, type Snippet } from '@/hooks/useSnippets';
import { SNIPPET_PRESETS } from '@/lib/snippetPresets';
import { SnippetDialog } from '@/pages/snippets/SnippetDialog';

export default function Snippets() {
  const { t } = useTranslation(['snippets', 'common']);
  const { data: snippets, isLoading } = useSnippets();
  const deleteSnippet = useDeleteSnippet();
  const createSnippet = useCreateSnippet();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = snippets?.filter((s) => {
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q);
  });

  const openNew = () => { setEditing(null); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> {t('newButton')}
        </Button>
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
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <p className="text-muted-foreground mb-4">
              {search ? t('empty.noResults') : t('empty.none')}
            </p>
            {!search && (
              <Button variant="outline" onClick={openNew}>
                <Plus className="mr-2 h-4 w-4" /> {t('empty.addFirst')}
              </Button>
            )}
          </div>

          {!search && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">{t('presetsTitle')}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {SNIPPET_PRESETS.map((p) => (
                  <div key={p.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{t(`presets.${p.id}.title`)}</p>
                      <Badge variant="outline">{t(`kinds.${p.kind}`)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {t(`presets.${p.id}.body`)}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={createSnippet.isPending}
                      onClick={() => createSnippet.mutate({
                        kind: p.kind,
                        title: t(`presets.${p.id}.title`),
                        body: t(`presets.${p.id}.body`),
                      })}
                    >
                      {t('usePreset')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.title')}</TableHead>
                <TableHead>{t('table.body')}</TableHead>
                <TableHead>{t('table.kind')}</TableHead>
                <TableHead className="w-[100px]">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell className="max-w-[360px] truncate text-muted-foreground">{s.body}</TableCell>
                  <TableCell><Badge variant="secondary">{t(`kinds.${s.kind}`)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(s.id)}>
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

      <SnippetDialog open={dialogOpen} onOpenChange={setDialogOpen} snippet={editing} />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deletingId) deleteSnippet.mutate(deletingId); setDeletingId(null); }}
            >
              {t('common:actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
