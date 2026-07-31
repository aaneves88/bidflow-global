import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ExternalLink, ShieldAlert, Loader2, CreditCard, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { openExternal } from '@/lib/openExternal';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripePortal } from '@/hooks/useStripePortal';
import { formatDate } from '@/lib/format';
import { PixKeyCard } from '@/components/PixKeyCard';


const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  past_due: 'destructive',
  cancelled: 'secondary',
};

export default function AccountPage() {
  const { t } = useTranslation(['settings', 'common']);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { data: subscription, isLoading: loadingSubscription } = useSubscription();
  const { openPortal, loading: portalLoading } = useStripePortal();

  const CONFIRM_WORD = t('account.deleteConfirmWord');


  const handleDelete = async () => {
    if (confirm.trim().toUpperCase() !== CONFIRM_WORD.toUpperCase()) {
      toast({ title: t('account.deleteWrongConfirm'), variant: 'destructive' });
      return;
    }
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account', { body: {} });
      if (error) throw error;
      toast({ title: t('account.deleteDone') });
      await signOut();
      navigate('/', { replace: true });
    } catch (e: any) {
      toast({ title: t('messages.error'), description: e?.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('account.title')}</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('account.profileTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>{t('account.email')}</Label>
            <Input value={user?.email ?? ''} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> {t('subscription.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSubscription ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground">{t('subscription.currentPlan')}</p>
                  <p className="text-lg font-semibold">
                    {subscription?.plan?.name ?? t('subscription.freePlan')}
                  </p>
                </div>
                {subscription && (
                  <Badge variant={STATUS_VARIANT[subscription.status] ?? 'outline'}>
                    {t(`subscription.status.${subscription.status}`, {
                      defaultValue: subscription.status,
                    })}
                  </Badge>
                )}
              </div>

              {subscription?.expires_at && (
                <p className="text-sm text-muted-foreground">
                  {subscription.status === 'cancelled'
                    ? t('subscription.endedAt', { date: formatDate(subscription.expires_at) })
                    : t('subscription.renewsAt', { date: formatDate(subscription.expires_at) })}
                </p>
              )}

              {subscription?.status === 'past_due' && (
                <p className="text-sm text-destructive">{t('subscription.pastDueHint')}</p>
              )}

              {subscription?.isPaid ? (
                <Button onClick={openPortal} disabled={portalLoading} variant="outline">
                  {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('subscription.manage')}
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/pricing">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('subscription.upgrade')}
                  </Link>
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <PixKeyCard />





      <Card>
        <CardHeader><CardTitle className="text-base">{t('account.legalTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <button
            type="button"
            onClick={() => openExternal('https://orca-mento.app/legal/terms')}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {t('account.terms')} <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openExternal('https://orca-mento.app/legal/privacy')}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {t('account.privacy')} <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" /> {t('account.dangerTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t('account.deleteDescription')}</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{t('account.deleteCta')}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('account.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('account.deleteConfirmBody', { word: CONFIRM_WORD })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                placeholder={CONFIRM_WORD}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="my-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirm('')}>
                  {t('common:actions.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('account.deleteCta')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
