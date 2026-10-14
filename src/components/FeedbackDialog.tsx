import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MessageSquareHeart } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SUPPORT_INBOX = 'statematch@statematch.global';

interface Props {
  mode: 'manual' | 'prompt';
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  days?: number;
}

export function FeedbackDialog({ mode, trigger, open: openProp, onOpenChange, days }: Props) {
  const { t } = useTranslation('support');
  const { user } = useAuth();
  const location = useLocation();
  const [innerOpen, setInnerOpen] = useState(false);
  const open = openProp ?? innerOpen;
  const setOpen = (v: boolean) => { onOpenChange?.(v); if (openProp === undefined) setInnerOpen(v); };
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!user) { toast.error(t('needAuth')); return; }
    const body = description.trim();
    if (body.length < 5) return;
    setSending(true);
    try {
      const pagePath = location.pathname + location.search;
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          reporter_email: user.email ?? '',
          category: 'feedback',
          description: body,
          page_path: pagePath,
          user_agent: navigator.userAgent,
        })
        .select('id, created_at')
        .single();
      if (error) throw error;

      await supabase.from('support_ticket_messages').insert({
        ticket_id: ticket.id, author_id: user.id, author_role: 'user', body,
      });

      const { error: mailErr } = await supabase.functions.invoke('send-support-email', {
        body: { action: 'report', ticketId: ticket.id, categoryLabel: t('categories.feedback') },
      });
      if (mailErr) console.error('feedback notification failed', mailErr);

      toast.success(t('feedbackDialog.success'));
      setDescription('');
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t('feedbackDialog.error'));
    } finally {
      setSending(false);
    }
  };

  const isPrompt = mode === 'prompt';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isPrompt && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <MessageSquareHeart className="mr-2 h-4 w-4" />
              {t('feedbackDialog.trigger')}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isPrompt ? t('feedbackDialog.promptTitle') : t('feedbackDialog.title')}</DialogTitle>
          <DialogDescription>
            {isPrompt ? t('feedbackDialog.promptSubtitle', { days }) : t('feedbackDialog.subtitle')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-description">{t('feedbackDialog.label')}</Label>
            <Textarea
              id="feedback-description"
              rows={5}
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={submit} disabled={sending || description.trim().length < 5}>
            {sending ? t('feedbackDialog.sending') : t('feedbackDialog.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
