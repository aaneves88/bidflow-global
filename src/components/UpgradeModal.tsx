import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStripePaymentLink } from '@/lib/stripeCheckout';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({ open, onOpenChange, title, description }: UpgradeModalProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpgrade = () => {
    const paymentLink = getStripePaymentLink(user);
    onOpenChange(false);
    if (paymentLink) {
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    } else {
      navigate('/pricing');
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {title ?? t('upgradeModal.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description ?? t('upgradeModal.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('upgradeModal.viewPlans')}
          </Button>
          <Button onClick={handleUpgrade}>
            {t('upgradeModal.upgrade')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
