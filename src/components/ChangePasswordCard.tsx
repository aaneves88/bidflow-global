import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export function ChangePasswordCard() {
  const { t } = useTranslation('auth');
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast({ title: t('reset.tooShort'), variant: 'destructive' });
    if (password !== confirm) return toast({ title: t('reset.mismatch'), variant: 'destructive' });
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password, current_password: current } as any);
    setLoading(false);
    if (error) return toast({ title: t('reset.error'), description: error.message, variant: 'destructive' });
    setCurrent(''); setPassword(''); setConfirm('');
    toast({ title: t('reset.changed') });
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('reset.changeTitle')}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="cur-pw">{t('reset.currentPassword')}</Label>
            <Input id="cur-pw" type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-pw">{t('reset.newPassword')}</Label>
            <Input id="new-pw" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="conf-pw">{t('reset.confirmPassword')}</Label>
            <Input id="conf-pw" type="password" required minLength={6} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>{t('reset.changeCta')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
