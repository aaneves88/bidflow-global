import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PIX_KEY_TYPES, isValidPixKey, type PixKeyType } from '@/lib/pix';

export function PixKeyCard() {
  const { t } = useTranslation(['settings', 'common']);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [keyType, setKeyType] = useState<PixKeyType>('cpf');
  const [pixKey, setPixKey] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pix-key', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('pix_key, pix_key_type')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data && !hydrated) {
      setPixKey(data.pix_key || '');
      setKeyType(((data.pix_key_type as PixKeyType) || 'cpf'));
      setHydrated(true);
    }
  }, [data, hydrated]);

  const save = useMutation({
    mutationFn: async (patch: { pix_key: string | null; pix_key_type: string | null }) => {
      const { error } = await supabase.from('profiles').update(patch).eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pix-key'] });
    },
  });

  const handleSave = async () => {
    const trimmed = pixKey.trim();
    if (trimmed && !isValidPixKey(trimmed, keyType)) {
      toast({ title: t('pix.invalid'), variant: 'destructive' });
      return;
    }
    try {
      await save.mutateAsync({
        pix_key: trimmed || null,
        pix_key_type: trimmed ? keyType : null,
      });
      toast({ title: trimmed ? t('pix.saved') : t('pix.removed') });
    } catch (e: any) {
      toast({ title: t('messages.error'), description: e?.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-4 w-4" /> {t('pix.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('pix.description')}</p>

        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div>
              <Label>{t('pix.keyType')}</Label>
              <Select value={keyType} onValueChange={(v) => setKeyType(v as PixKeyType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PIX_KEY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{t(`pix.types.${type}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('pix.key')}</Label>
              <Input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={t('pix.keyPlaceholder')}
                maxLength={140}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={save.isPending}>
                {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('pix.save')}
              </Button>
              {!!data?.pix_key && (
                <Button
                  variant="outline"
                  onClick={() => { setPixKey(''); }}
                  disabled={save.isPending}
                >
                  {t('pix.remove')}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
