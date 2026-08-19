import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useBranding } from '@/hooks/useBranding';
import { usePublicAppUrl, buildPublicProposalUrl } from '@/hooks/usePublicAppUrl';
import { formatCurrency, formatDate } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

export type SendableProposal = {
  id: string;
  title: string;
  public_code: string;
  currency: string;
  total_amount: number;
  valid_until?: string | null;
  client_id?: string | null;
  clients?: { name: string; email: string | null; phone?: string | null } | null;
};

function buildWhatsAppUrl(phone: string | null | undefined, message: string) {
  const digits = (phone || '').replace(/\D/g, '');
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: SendableProposal | null;
};

export function SendProposalDialog({ open, onOpenChange, proposal }: Props) {
  const { t } = useTranslation(['proposals', 'common']);
  const branding = useBranding();
  const publicBase = usePublicAppUrl();

  const [phoneInput, setPhoneInput] = useState('');
  const [savePhone, setSavePhone] = useState(true);
  const [askPhone, setAskPhone] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (open && proposal) {
      setPhoneInput('');
      setSavePhone(true);
      setAskPhone(false);
      setEmailTo(proposal.clients?.email || '');
    }
  }, [open, proposal]);

  if (!proposal) return null;

  const publicUrl = buildPublicProposalUrl(publicBase, proposal.public_code);
  const totalFmt = formatCurrency(Number(proposal.total_amount), proposal.currency);
  const whatsappMessage = t('share.whatsappMessage', {
    clientName: proposal.clients?.name || t('share.defaultClient'),
    title: proposal.title,
    total: totalFmt,
    url: publicUrl,
  });
  const clientPhone = proposal.clients?.phone || '';
  const hasPhone = clientPhone.replace(/\D/g, '').length >= 10;

  const openWhatsapp = (phone: string) => {
    window.open(buildWhatsAppUrl(phone, whatsappMessage), '_blank', 'noopener,noreferrer');
  };

  const handleWhatsappClick = () => {
    if (hasPhone) {
      openWhatsapp(clientPhone);
      return;
    }
    setAskPhone(true);
  };

  const confirmWhatsappPhone = async () => {
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length < 10) return;
    if (savePhone && proposal.client_id) {
      const { error } = await supabase
        .from('clients')
        .update({ phone: phoneInput.trim() })
        .eq('id', proposal.client_id);
      if (!error) toast({ title: t('view.whatsappPhoneSaved') });
    }
    setAskPhone(false);
    openWhatsapp(digits);
  };

  const sendEmail = async () => {
    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'proposal-sent',
          recipientEmail: emailTo.trim(),
          idempotencyKey: `proposal-sent-${proposal.id}-${emailTo.trim().toLowerCase()}`,
          templateData: {
            clientName: proposal.clients?.name || null,
            senderName: branding?.companyName || null,
            proposalTitle: proposal.title,
            proposalTotal: totalFmt,
            publicUrl,
            validUntil: proposal.valid_until ? formatDate(proposal.valid_until) : null,
          },
        },
      });
      if (error) throw error;
      toast({ title: t('view.sendEmailSuccess') });
    } catch (e: any) {
      toast({ title: t('view.sendEmailError'), description: e.message, variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('send.title')}</DialogTitle>
          <DialogDescription>{t('send.description', { title: proposal.title })}</DialogDescription>
        </DialogHeader>

        {askPhone ? (
          <div className="space-y-3">
            <Label htmlFor="send-wa-phone">{t('view.whatsappPhoneField')}</Label>
            <Input
              id="send-wa-phone"
              type="tel"
              inputMode="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder={t('view.whatsappPhonePlaceholder')}
            />
            <p className="text-xs text-muted-foreground">{t('view.whatsappPhoneHelp')}</p>
            {proposal.client_id && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={savePhone} onCheckedChange={(v) => setSavePhone(v === true)} />
                {t('view.whatsappPhoneSave')}
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAskPhone(false)}>
                {t('common:actions.cancel')}
              </Button>
              <Button disabled={phoneInput.replace(/\D/g, '').length < 10} onClick={confirmWhatsappPhone}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {t('view.whatsappPhoneConfirm')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleWhatsappClick}>
              <MessageCircle className="mr-2 h-4 w-4" />
              {t('view.sendWhatsapp')}
            </Button>

            <div className="space-y-2 rounded-md border p-3">
              <Label htmlFor="send-email-to">{t('view.sendEmailField')}</Label>
              <Input
                id="send-email-to"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="cliente@exemplo.com"
              />
              <p className="text-xs text-muted-foreground">{t('view.sendEmailHelp')}</p>
              <Button
                className="w-full"
                variant="outline"
                disabled={sendingEmail || !/^\S+@\S+\.\S+$/.test(emailTo)}
                onClick={sendEmail}
              >
                {sendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                {t('view.sendEmailConfirm')}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast({ title: t('messages.linkCopied'), description: publicUrl });
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              {t('view.copyLink')}
            </Button>
          </div>
        )}

        {!askPhone && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('send.statusOnly')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
