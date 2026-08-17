import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, FileText, Layers, Repeat, PenLine } from 'lucide-react';
import { PROPOSAL_TEMPLATE_IDS, type ProposalTemplateId } from '@/lib/proposalTemplates';

const TOTAL_STEPS = 2;
const DRAFT_KEY = 'orca:onboarding:draft';

type Draft = {
  step: number;
  businessName: string;
};

const TEMPLATE_ICONS: Record<ProposalTemplateId, typeof FileText> = {
  simple: FileText,
  phased: Layers,
  recurring: Repeat,
};

/** Rascunho local do wizard: sobrevive a re-render/remount vindo de refresh de sessão. */
function loadDraft(): Partial<Draft> {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function Onboarding() {
  const { t } = useTranslation(['onboarding', 'proposals', 'common']);
  const { user, isAdmin, refreshOnboarding } = useAuth();
  const { upsert } = useAppSettings('general');
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(() => loadDraft().step ?? 1);
  const [businessName, setBusinessName] = useState(() => loadDraft().businessName ?? '');
  const [namePrefilled, setNamePrefilled] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, businessName }));
  }, [step, businessName]);

  useEffect(() => {
    if (!namePrefilled && user?.user_metadata?.full_name && !businessName) {
      setBusinessName(user.user_metadata.full_name);
    }
    if (user) setNamePrefilled(true);
  }, [user, businessName, namePrefilled]);

  const finishAndGo = async (path: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const uid = currentUser?.id;
    if (uid) {
      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', uid);
      await refreshOnboarding();
    }
    sessionStorage.removeItem(DRAFT_KEY);
    navigate(path, { replace: true });
  };

  const finish = () => finishAndGo('/dashboard');

  const handleStep1 = async () => {
    try {
      if (businessName.trim()) {
        await supabase.from('profiles').update({ full_name: businessName }).eq('id', user!.id);
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
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={t('welcome.businessPlaceholder')}
                />
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
                <h3 className="font-semibold text-lg">{t('template.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('template.description')}</p>
              </div>
              <div className="grid gap-3">
                {PROPOSAL_TEMPLATE_IDS.map((tplId) => {
                  const Icon = TEMPLATE_ICONS[tplId];
                  return (
                    <button
                      key={tplId}
                      type="button"
                      onClick={() => finishAndGo(`/proposals/new?template=${tplId}`)}
                      className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent/40"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>
                        <span className="block font-medium">
                          {t(`proposals:templates.options.${tplId}.title`)}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {t(`proposals:templates.options.${tplId}.description`)}
                        </span>
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => finishAndGo('/proposals/new')}
                  className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-left transition-colors hover:border-primary hover:bg-accent/40"
                >
                  <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="block font-medium">{t('proposals:templates.blank.title')}</span>
                    <span className="block text-sm text-muted-foreground">
                      {t('proposals:templates.blank.description')}
                    </span>
                  </span>
                </button>
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
