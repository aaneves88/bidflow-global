import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useCreateClient } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';

const TOTAL_STEPS = 3;

export default function Onboarding() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { user, isAdmin } = useAuth();
  const { upsert } = useAppSettings('general');
  const createClient = useCreateClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [businessName, setBusinessName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');

  useEffect(() => {
    if (user?.user_metadata?.full_name && !businessName) {
      setBusinessName(user.user_metadata.full_name);
    }
  }, [user, businessName]);

  const finish = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const uid = currentUser?.id;
    if (uid) {
      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', uid);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    navigate('/dashboard', { replace: true });
  };

  const finishAndGo = async (path: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const uid = currentUser?.id;
    if (uid) {
      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', uid);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    navigate(path, { replace: true });
  };

  const handleStep1 = async () => {
    try {
      if (businessName.trim()) {
        // Update profile
        await supabase.from('profiles').update({ full_name: businessName }).eq('id', user!.id);
        // If admin, also save as company name in settings
        if (isAdmin) {
          await upsert.mutateAsync({ key: 'company_name', value: businessName, category: 'general' });
        }
        toast({ title: t('messages.saved') });
      }
    } catch {
      // non-blocking
    }
    setStep(2);
  };

  const handleStep2 = async () => {
    if (clientName.trim()) {
      try {
        await createClient.mutateAsync({
          name: clientName,
          email: clientEmail,
          company: clientCompany,
          phone: '',
          notes: '',
        });
        toast({ title: t('messages.clientCreated') });
      } catch {
        // non-blocking
      }
    }
    setStep(3);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {t('step', { current: step, total: TOTAL_STEPS })}
          </p>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div>
                <h3 className="font-semibold text-lg">{t('welcome.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('welcome.description')}</p>
              </div>
              <div>
                <Label>{t('welcome.businessName')}</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={t('welcome.businessPlaceholder')} />
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>{t('actions.skip')}</Button>
                <Button onClick={handleStep1}>{t('actions.next')}<ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h3 className="font-semibold text-lg">{t('client.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('client.description')}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>{t('client.name')}</Label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div>
                  <Label>{t('client.email')}</Label>
                  <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                </div>
                <div>
                  <Label>{t('client.company')}</Label>
                  <Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}>{t('actions.skip')}</Button>
                <Button onClick={handleStep2}>{t('actions.next')}<ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h3 className="font-semibold text-lg">{t('proposal.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('proposal.description')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => finishAndGo('/proposals/new')}>
                  {t('proposal.create')}
                </Button>
                <Button variant="outline" onClick={finish}>{t('proposal.later')}</Button>
              </div>
              <div className="text-center">
                <Button variant="link" onClick={finish}>{t('actions.finish')}</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
