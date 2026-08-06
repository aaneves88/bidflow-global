import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LifeBuoy } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Category = 'bug' | 'question' | 'suggestion';

const SUPPORT_INBOX = 'statematch@statematch.global';

export function SupportDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { t } = useTranslation('support');
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>('bug');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const reset = () => {
    setCategory('bug');
    setDescription('');
    setFile(null);
  };

  const submit = async () => {
    if (!user) {
      toast.error(t('needAuth'));
      return;
    }
    const body = description.trim();
    if (body.length < 5) return;

    setSending(true);
    try {
      let attachmentPath: string | null = null;
      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('support-attachments')
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        attachmentPath = path;
      }

      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          reporter_email: user.email ?? '',
          category,
          description: body,
          page_path: location.pathname + location.search,
          user_agent: navigator.userAgent,
          attachment_path: attachmentPath,
        })
        .select('id, created_at')
        .single();
      if (error) throw error;

      await supabase.from('support_ticket_messages').insert({
        ticket_id: ticket.id,
        author_id: user.id,
        author_role: 'user',
        body,
      });

      // Notificação por e-mail (fila de e-mail do projeto) — best effort.
      const { error: mailErr } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'support-report',
          recipientEmail: SUPPORT_INBOX,
          idempotencyKey: `support-report-${ticket.id}`,
          templateData: {
            reporterEmail: user.email ?? '',
            categoryLabel: t(`categories.${category}`),
            description: body,
            pagePath: location.pathname + location.search,
            userAgent: navigator.userAgent,
            createdAt: new Date(ticket.created_at).toLocaleString('pt-BR'),
            ticketId: ticket.id,
          },
        },
      });
      if (mailErr) console.error('support notification failed', mailErr);

      toast.success(t('success'));
      reset();
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t('error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <LifeBuoy className="mr-2 h-4 w-4" />
            {t('trigger')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">{t('categories.bug')}</SelectItem>
                <SelectItem value="question">{t('categories.question')}</SelectItem>
                <SelectItem value="suggestion">{t('categories.suggestion')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-description">{t('description')}</Label>
            <Textarea
              id="support-description"
              rows={5}
              maxLength={4000}
              value={description}
              placeholder={t('descriptionPlaceholder')}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-file">{t('attachment')}</Label>
            <Input
              id="support-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <p className="text-xs text-muted-foreground">{t('context')}</p>

          <Button className="w-full" onClick={submit} disabled={sending || description.trim().length < 5}>
            {sending ? t('sending') : t('submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
