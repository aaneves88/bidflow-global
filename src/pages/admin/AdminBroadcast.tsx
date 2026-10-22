import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Eye, Loader2, Mail, Send } from 'lucide-react';

interface Recipient {
  id: string;
  email: string;
  full_name: string | null;
  suppressed: boolean;
}

const TEMPLATE_NOVIDADES = 'novidades-pagamento-ajuda';
const CUSTOM = 'custom';

export default function AdminBroadcast() {
  const { t } = useTranslation('admin');
  const [templateId, setTemplateId] = useState<string>(TEMPLATE_NOVIDADES);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-broadcast-recipients'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-broadcast', {
        body: { action: 'recipients' },
      });
      if (error) throw error;
      return (data?.recipients ?? []) as Recipient[];
    },
  });

  const recipients = useMemo(() => data ?? [], [data]);
  const sendable = useMemo(() => recipients.filter((r) => !r.suppressed), [recipients]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter(
      (r) => (r.full_name || '').toLowerCase().includes(q) || r.email.includes(q),
    );
  }, [recipients, search]);

  const allSelected = sendable.length > 0 && sendable.every((r) => selected.has(r.email));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(sendable.map((r) => r.email)));
  };

  const toggleOne = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const contentPayload = () =>
    templateId === CUSTOM
      ? { custom: { subject: customSubject.trim(), body: customBody.trim() } }
      : { templateId };

  const contentValid =
    templateId === CUSTOM
      ? customSubject.trim().length > 0 && customBody.trim().length > 0
      : true;

  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-broadcast', {
        body: { action: 'preview', ...contentPayload() },
      });
      if (error) throw error;
      setPreviewHtml(data.sampleHtml);
      setPreviewSubject(data.subject);
      setPreviewOpen(true);
    } catch (err) {
      toast({ title: t('broadcast.previewError'), variant: 'destructive' });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-broadcast', {
        body: { action: 'send', emails: [...selected], ...contentPayload() },
      });
      if (error) throw error;
      toast({
        title: t('broadcast.sentTitle', { sent: data.sent, failed: data.failed }),
      });
      setConfirmOpen(false);
      setSelected(new Set());
    } catch (err) {
      toast({ title: t('broadcast.sendError'), variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> {t('broadcast.messageTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('broadcast.templateLabel')}</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TEMPLATE_NOVIDADES}>
                  {t('broadcast.templates.novidades')}
                </SelectItem>
                <SelectItem value={CUSTOM}>{t('broadcast.templates.custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {templateId === CUSTOM && (
            <>
              <div className="space-y-2">
                <Label>{t('broadcast.subjectLabel')}</Label>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  maxLength={150}
                  placeholder={t('broadcast.subjectPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('broadcast.bodyLabel')}</Label>
                <Textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={10}
                  maxLength={5000}
                  placeholder={t('broadcast.bodyPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">{t('broadcast.bodyHint')}</p>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!contentValid || loadingPreview}
            >
              {loadingPreview ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {t('broadcast.preview')}
            </Button>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!contentValid || selected.size === 0 || sending}
            >
              <Send className="mr-2 h-4 w-4" />
              {t('broadcast.send', { count: selected.size })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('broadcast.recipientsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('broadcast.searchPlaceholder')}
            />
            <Button variant="outline" size="sm" onClick={toggleAll} disabled={isLoading}>
              {allSelected ? t('broadcast.deselectAll') : t('broadcast.selectAll')}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('broadcast.selectedCount', { selected: selected.size, total: sendable.length })}
          </p>
          <div className="max-h-[420px] space-y-1 overflow-y-auto rounded-md border p-2">
            {isLoading && (
              <div className="flex justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {visible.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${
                  r.suppressed ? 'opacity-50' : 'cursor-pointer hover:bg-muted'
                }`}
              >
                <Checkbox
                  checked={selected.has(r.email)}
                  disabled={r.suppressed}
                  onCheckedChange={() => toggleOne(r.email)}
                />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {r.full_name ? `${r.full_name} — ` : ''}
                  {r.email}
                </span>
                {r.suppressed && (
                  <Badge variant="secondary">{t('broadcast.unsubscribed')}</Badge>
                )}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewSubject}</DialogTitle>
          </DialogHeader>
          {previewHtml && (
            <iframe
              title="preview"
              sandbox=""
              srcDoc={previewHtml}
              className="h-[60vh] w-full rounded-md border bg-white"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('broadcast.confirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('broadcast.confirmBody', { count: selected.size })}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={sending}>
              {t('broadcast.cancel')}
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('broadcast.confirmSend')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
