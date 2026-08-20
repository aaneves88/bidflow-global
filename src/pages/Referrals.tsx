import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useReferralProgram } from '@/hooks/useReferralProgram';
import { Gift, Copy, Users, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Referrals() {
  const { t } = useTranslation('referrals');
  const { toast } = useToast();
  const { referralCode, referrals, isLoading, copyLink } = useReferralProgram();

  const shareUrl = referralCode ? `https://orca-mento.app/register?ref=${referralCode}` : '';

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: t('copySuccess') });
    } catch {
      toast({ title: t('copyError'), variant: 'destructive' });
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'converted':
      case 'paid':
        return 'default';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="font-semibold text-lg">Orca</Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />{t('back')}</Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              {t('share.title')}
            </CardTitle>
            <CardDescription>{t('share.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="h-20 flex items-center justify-center text-muted-foreground">
                {t('loading')}
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input readOnly value={shareUrl} className="flex-1" />
                  <Button onClick={handleCopy} className="shrink-0">
                    <Copy className="mr-2 h-4 w-4" />
                    {t('share.copy')}
                  </Button>
                </div>
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{t('share.benefit1')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{t('share.benefit2')}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t('history.title')}
            </CardTitle>
            <CardDescription>{t('history.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">{t('history.empty')}</p>
            ) : (
              <div className="space-y-3">
                {referrals.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {r.referred?.full_name || r.referred?.email || t('history.anonymous')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={statusVariant(r.status)}>
                      {t(`status.${r.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
