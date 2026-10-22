import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Seo } from '@/components/Seo';

const RESEND_SECONDS = 60;

export default function ForgotPassword() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendCode = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    setLoading(false);
    if (error && error.status === 429) {
      toast({ title: t('reset.error'), description: error.message, variant: 'destructive' });
      return;
    }
    // Same message whether or not the account exists.
    setStep('code');
    setCooldown(RESEND_SECONDS);
    toast({ title: t('reset.sentInfo') });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendCode();
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast({ title: t('reset.tooShort'), variant: 'destructive' });
    if (password !== confirm) return toast({ title: t('reset.mismatch'), variant: 'destructive' });
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'recovery',
    });
    if (otpError) {
      setLoading(false);
      return toast({ title: t('reset.invalidCode'), variant: 'destructive' });
    }
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast({ title: t('reset.error'), description: error.message, variant: 'destructive' });
    toast({ title: t('reset.done') });
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Seo title="Redefinir senha — Orca" description="Recupere o acesso à sua conta Orca." noindex />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('reset.title')}</CardTitle>
          <CardDescription>{step === 'email' ? t('reset.emailStep') : t('reset.sentInfo')}</CardDescription>
        </CardHeader>
        {step === 'email' ? (
          <form onSubmit={handleEmail}>
            <CardContent className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('entry.emailPlaceholder')} />
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('reset.sending') : t('reset.sendCode')}
              </Button>
              <Link to="/login" className="text-sm text-primary underline">{t('reset.back')}</Link>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('reset.code')}</Label>
                <Input id="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={10}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-xl tracking-[0.4em]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('reset.newPassword')}</Label>
                <Input id="password" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t('reset.confirmPassword')}</Label>
                <Input id="confirm" type="password" required minLength={6} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('reset.submitting') : t('reset.submit')}
              </Button>
              <Button type="button" variant="ghost" size="sm" disabled={cooldown > 0 || loading} onClick={sendCode}>
                {cooldown > 0 ? t('reset.resendIn', { s: cooldown }) : t('reset.resend')}
              </Button>
              <Link to="/login" className="text-sm text-primary underline">{t('reset.back')}</Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
