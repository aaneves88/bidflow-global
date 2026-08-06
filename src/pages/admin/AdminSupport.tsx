import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Status = 'open' | 'answered' | 'closed';

const statusVariant: Record<Status, 'default' | 'secondary' | 'outline'> = {
  open: 'default',
  answered: 'secondary',
  closed: 'outline',
};

export default function AdminSupport() {
  const { t } = useTranslation('support');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: tickets = [] } = useQuery({
    queryKey: ['support_tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, support_ticket_messages(id, body, author_role, created_at)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
  };

  const openAttachment = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('support-attachments')
      .createSignedUrl(path, 300);
    if (error || !data) return toast.error(error?.message ?? 'error');
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  const sendReply = async (ticket: any) => {
    const body = (replies[ticket.id] ?? '').trim();
    if (body.length < 2 || !user) return;
    setSendingId(ticket.id);
    try {
      const { data: msg, error } = await supabase
        .from('support_ticket_messages')
        .insert({ ticket_id: ticket.id, author_id: user.id, author_role: 'admin', body })
        .select('id')
        .single();
      if (error) throw error;

      const { error: mailErr } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'support-reply',
          recipientEmail: ticket.reporter_email,
          idempotencyKey: `support-reply-${msg.id}`,
          templateData: {
            categoryLabel: t(`categories.${ticket.category}`),
            originalMessage: ticket.description,
            replyMessage: body,
          },
        },
      });
      if (mailErr) throw mailErr;

      await supabase.from('support_tickets').update({ status: 'answered' }).eq('id', ticket.id);
      setReplies((r) => ({ ...r, [ticket.id]: '' }));
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
      toast.success(t('admin.sent'));
    } catch (e) {
      console.error(e);
      toast.error(t('admin.error'));
    } finally {
      setSendingId(null);
    }
  };

  if (!tickets.length) {
    return <p className="text-sm text-muted-foreground py-6">{t('admin.empty')}</p>;
  }

  return (
    <div className="space-y-4 py-2">
      {tickets.map((ticket) => {
        const messages = [...(ticket.support_ticket_messages ?? [])].sort(
          (a: any, b: any) => a.created_at.localeCompare(b.created_at),
        );
        return (
          <Card key={ticket.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <CardTitle className="text-base">
                  {t(`categories.${ticket.category}`)} — {ticket.reporter_email}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[ticket.status as Status]}>
                    {t(`admin.statuses.${ticket.status}`)}
                  </Badge>
                  <Select value={ticket.status} onValueChange={(v) => setStatus(ticket.id, v as Status)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">{t('admin.statuses.open')}</SelectItem>
                      <SelectItem value="answered">{t('admin.statuses.answered')}</SelectItem>
                      <SelectItem value="closed">{t('admin.statuses.closed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(ticket.created_at).toLocaleString('pt-BR')} · {t('admin.page')}: {ticket.page_path ?? '—'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
              {ticket.attachment_path && (
                <Button variant="outline" size="sm" onClick={() => openAttachment(ticket.attachment_path)}>
                  {t('admin.attachment')}
                </Button>
              )}

              <Accordion type="single" collapsible>
                <AccordionItem value="history" className="border-none">
                  <AccordionTrigger className="text-sm py-2">
                    {t('admin.history')} ({messages.length})
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {messages.map((m: any) => (
                      <div key={m.id} className="rounded-md border p-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          {m.author_role === 'admin' ? t('admin.you') : t('admin.user')} ·{' '}
                          {new Date(m.created_at).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Textarea
                rows={3}
                value={replies[ticket.id] ?? ''}
                placeholder={t('admin.replyPlaceholder')}
                onChange={(e) => setReplies((r) => ({ ...r, [ticket.id]: e.target.value }))}
              />
              <Button
                size="sm"
                disabled={sendingId === ticket.id || (replies[ticket.id] ?? '').trim().length < 2}
                onClick={() => sendReply(ticket)}
              >
                {sendingId === ticket.id ? t('admin.sending') : t('admin.send')}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
