import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  useCreateSnippet, useUpdateSnippet, SNIPPET_KINDS, type Snippet, type SnippetKind,
} from '@/hooks/useSnippets';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snippet: Snippet | null;
};

export function SnippetDialog({ open, onOpenChange, snippet }: Props) {
  const { t } = useTranslation(['snippets', 'common']);
  const create = useCreateSnippet();
  const update = useUpdateSnippet();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<SnippetKind>('terms');

  useEffect(() => {
    if (!open) return;
    setTitle(snippet?.title || '');
    setBody(snippet?.body || '');
    setKind(snippet?.kind || 'terms');
  }, [open, snippet]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const payload = { title: title.trim(), body: body.trim(), kind };
    if (snippet) await update.mutateAsync({ id: snippet.id, ...payload });
    else await create.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{snippet ? t('dialog.editTitle') : t('dialog.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('fields.title')} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('fields.titlePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t('fields.kind')}</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as SnippetKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SNIPPET_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>{t(`kinds.${k}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">{t('fields.body')} *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder={t('fields.bodyPlaceholder')}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {t('common:actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
