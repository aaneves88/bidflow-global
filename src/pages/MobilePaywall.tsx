import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';

type RCPackage = {
  identifier: string;
  product: {
    identifier: string;
    title: string;
    description?: string;
    priceString: string;
    price: number;
    currencyCode: string;
  };
};

/**
 * Mobile-only paywall. Shown in place of the web Pricing page when the app
 * runs inside the native Android/iOS shell. Apple/Google forbid linking out
 * to web checkout, so we only present in-app purchase options here.
 */
export default function MobilePaywall() {
  const { t } = useTranslation(['pricing', 'common']);
  const { user } = useAuth();
  const { data: currentPlan } = useCurrentPlan();
  const [packages, setPackages] = useState<RCPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const offerings = await Purchases.getOfferings();
        const current = offerings?.current?.availablePackages ?? [];
        if (!cancelled) setPackages(current as unknown as RCPackage[]);
      } catch (err: any) {
        if (!cancelled) {
          toast({
            title: t('comingSoon'),
            description: err?.message || t('comingSoonDescription'),
            variant: 'destructive',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handlePurchase = async (pkg: RCPackage) => {
    setPurchasing(pkg.identifier);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      await Purchases.purchasePackage({ aPackage: pkg as any });
      toast({ title: t('subscribe'), description: pkg.product.title });
    } catch (err: any) {
      if (!err?.userCancelled) {
        toast({ title: 'Erro', description: err?.message ?? String(err), variant: 'destructive' });
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      await Purchases.restorePurchases();
      toast({ title: t('common:actions.success', { defaultValue: 'OK' }) });
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message ?? String(err), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight">Orca</Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />{t('common:nav.dashboard')}</Link>
          </Button>
        </div>
      </nav>

      <section className="py-10 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : packages.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t('noPlans')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => {
                const isAnnual = pkg.identifier.toLowerCase().includes('annual')
                  || pkg.identifier.toLowerCase().includes('year');
                return (
                  <Card key={pkg.identifier}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{pkg.product.title}</CardTitle>
                        {isAnnual && <Badge variant="default">−20%</Badge>}
                      </div>
                      {pkg.product.description && (
                        <p className="text-sm text-muted-foreground">{pkg.product.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="text-2xl font-bold">{pkg.product.priceString}</span>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{t('features.unlimited')}</span>
                        </li>
                      </ul>
                      <Button
                        className="w-full"
                        disabled={!!purchasing || !user}
                        onClick={() => handlePurchase(pkg)}
                      >
                        {purchasing === pkg.identifier ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('subscribe')
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}

              <Button variant="ghost" className="w-full" onClick={handleRestore}>
                {t('common:actions.refresh', { defaultValue: 'Restaurar compras' })}
              </Button>

              {currentPlan && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  {t('current')}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
