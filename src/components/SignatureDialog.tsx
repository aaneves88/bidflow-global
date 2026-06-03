import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publicCode: string;
  defaultEmail?: string;
  primaryColor?: string;
  onSigned?: () => void;
}

export function SignatureDialog({ open, onOpenChange, publicCode, defaultEmail, primaryColor = '#3B82F6', onSigned }: Props) {
  const { t } = useTranslation(['public', 'common']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(defaultEmail || '');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setEmail(defaultEmail || '');
    setAgreed(false);
  };

  const handleSign = async () => {
    if (name.trim().length < 2) {
      toast({ title: t('signature.nameTooShort'), variant: 'destructive' });
      return;
    }
    if (!agreed) {
      toast({ title: t('signature.mustAgree'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc('sign_proposal', {
        p_code: publicCode,
        p_signer_name: name.trim(),
        p_signer_email: email.trim() || null,
        p_user_agent: navigator.userAgent.slice(0, 250),
      });
      if (error) throw error;
      toast({ title: t('signature.success') });
      reset();
      onOpenChange(false);
      onSigned?.();
    } catch (e: any) {
      toast({ title: t('signature.error'), description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('signature.title')}</DialogTitle>
          <DialogDescription>{t('signature.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t('signature.name')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('signature.namePlaceholder')}
              autoFocus
            />
          </div>
          <div>
            <Label>{t('signature.email')}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          {name.trim() && (
            <div className="border rounded-md p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">{t('signature.preview')}</p>
              <p
                className="text-2xl border-b border-dashed pb-1"
                style={{ fontFamily: '"Brush Script MT", cursive', color: primaryColor }}
              >
                {name}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('signature.timestamp', { date: new Date().toLocaleString() })}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Checkbox id="sig-agree" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
            <label htmlFor="sig-agree" className="text-sm leading-tight cursor-pointer">
              {t('signature.agree')}{' '}
              <Link to="/legal/terms" target="_blank" className="underline">
                {t('signature.terms')}
              </Link>
              .
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={handleSign}
            disabled={submitting || !agreed || name.trim().length < 2}
            style={{ backgroundColor: primaryColor, color: '#fff' }}
            className="hover:opacity-90"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {submitting ? t('signature.signing') : t('signature.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
