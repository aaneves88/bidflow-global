import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePlans } from '@/hooks/usePlans';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

export default function Pricing() {
  const { t } = useTranslation(['pricing', 'common']);
  const { user } = useAuth();
  const { plans, isLoading } = usePlans();
  const { data: currentPlan } = useCurrentPlan();
  const { getSetting } = useAppSettings('integrations');
  const navigate = useNavigate();

  const stripeEnabled = getSetting('stripe_enabled') === true;

  const intervalSuffix = (interval: string) => {
    const map: Record<string, string> = { month: t('interval.month'), year: t('interval.year'), week: t('interval.week'), day: t('interval.day') };
    return map[interval] || `/${interval}`;
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate(`/register?plan=${planId}`);
      return;
    }
    if (!stripeEnabled) {
      toast({ title: t('comingSoon'), description: t('comingSoonDescription') });
      return;
    }
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { plan_id: planId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">Orca</Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="ghost" asChild>
                <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />{t('common:nav.dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/login">{t('common:nav.signIn')}</Link></Button>
                <Button asChild><Link to="/register">{t('common:nav.getStarted')}</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t('title')}</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground">{t('loading')}</p>
          ) : plans.length === 0 ? (
            <p className="text-center text-muted-foreground">{t('noPlans')}</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
              {plans.map((p: any) => {
                const isCurrent = currentPlan?.plan_id === p.id;
                const features = Array.isArray(p.features) ? p.features : [];
                return (
                  <Card key={p.id} className={p.is_starter ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-2xl">{p.name}</CardTitle>
                        {p.is_starter && <Badge variant="default">{t('starter')}</Badge>}
                      </div>
                      {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        {Number(p.price) === 0 ? (
                          <span className="text-3xl font-bold">{t('free')}</span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold">{formatCurrency(Number(p.price), p.currency)}</span>
                            <span className="text-muted-foreground">{intervalSuffix(p.interval)}</span>
                          </>
                        )}
                        {p.trial_days > 0 && (
                          <Badge variant="outline" className="ml-2">{t('trialBadge', { days: p.trial_days })}</Badge>
                        )}
                      </div>

                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>
                            {p.max_proposals === null
                              ? t('features.unlimited') + ' — ' + t('common:nav.proposals').toLowerCase()
                              : t('features.proposalsLimit', { count: p.max_proposals })}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>
                            {p.max_clients === null
                              ? t('features.unlimitedClients')
                              : t('features.clientsLimit', { count: p.max_clients })}
                          </span>
                        </li>
                        {features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrent ? (
                        <Button className="w-full" disabled>{t('current')}</Button>
                      ) : !user ? (
                        <Button className="w-full" asChild>
                          <Link to={`/register?plan=${p.id}`}>{t('getStarted')}</Link>
                        </Button>
                      ) : Number(p.price) === 0 ? (
                        <Button className="w-full" variant="outline" asChild>
                          <Link to="/dashboard">{t('common:nav.dashboard')}</Link>
                        </Button>
                      ) : stripeEnabled ? (
                        <Button className="w-full" onClick={() => handleSubscribe(p.id)}>{t('subscribe')}</Button>
                      ) : (
                        <Button className="w-full" variant="outline" disabled title={t('comingSoonDescription')}>
                          {t('comingSoon')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
