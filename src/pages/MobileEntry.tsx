import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { useOAuthErrorNotice } from '@/hooks/useOAuthErrorNotice';
import { isNativeMobile } from '@/lib/platform';
import { trackMeta } from '@/lib/analytics';
import { persistSignupAttribution } from '@/lib/attributionSync';
import orcaMark from '@/assets/brand/orca-mark-sm.png';

export default function MobileEntry() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useOAuthErrorNotice();

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: t('login.errorTitle'), description: error.message, variant: 'destructive' });
      } else {
        navigate('/dashboard');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: name },
        },
      });
      if (error) {
        toast({ title: t('register.errorTitle'), description: error.message, variant: 'destructive' });
      } else {
        await persistSignupAttribution();
        trackMeta('CompleteRegistration');
        toast({ title: t('register.successTitle'), description: t('register.successDescription') });
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 py-8">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg p-2">
            <img src={orcaMark} alt="Orca" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Orca</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('entry.tagline')}</p>
        </div>

        {!isNativeMobile() && (
          <>
            <GoogleSignInButton disabled={loading} onSuccess={() => navigate('/dashboard')} />


            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs uppercase text-muted-foreground">{t('entry.or')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'signin' | 'signup')}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">{t('entry.signInTab')}</TabsTrigger>
            <TabsTrigger value="signup">{t('entry.signUpTab')}</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <TabsContent value="signup" className="m-0">
              <Input
                type="text"
                placeholder={t('entry.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === 'signup'}
                className="h-12"
              />
            </TabsContent>
            <Input
              type="email"
              placeholder={t('entry.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12"
            />
            <Input
              type="password"
              placeholder={t('entry.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              className="h-12"
            />
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? t('entry.loading') : mode === 'signin' ? t('entry.signInCta') : t('entry.signUpCta')}
            </Button>
          </form>
        </Tabs>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8 px-4">
        {t('entry.terms')}{' '}
        <Link to="/legal/terms" className="underline">{t('entry.termsLink')}</Link>
        {' '}{t('entry.and')}{' '}
        <Link to="/legal/privacy" className="underline">{t('entry.privacyLink')}</Link>.
      </p>
    </div>
  );
}

