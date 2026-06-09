import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import orcaMark from '@/assets/brand/orca-mark.png';

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
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ title: t('entry.googleError'), description: String(result.error?.message ?? ''), variant: 'destructive' });
      setGoogleLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate('/dashboard');
  };

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
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl tracking-tight">CF</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Orca</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('entry.tagline')}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <GoogleIcon />
              <span className="ml-2">{t('entry.google')}</span>
            </>
          )}
        </Button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs uppercase text-muted-foreground">{t('entry.or')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

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
            <Button type="submit" className="w-full h-12" disabled={loading || googleLoading}>
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
