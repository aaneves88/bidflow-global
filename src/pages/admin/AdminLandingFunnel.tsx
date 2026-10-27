import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Row = { step: string; total: number };

export default function AdminLandingFunnel() {
  const { t } = useTranslation('admin');
  const { data } = useQuery({
    queryKey: ['admin-landing-funnel'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_landing_funnel', { _days: 30 });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('landingFunnel.title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-5">
        {(data ?? []).map((r) => (
          <div key={r.step} className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{Number(r.total)}</p>
            <p className="text-xs text-muted-foreground">{t(`landingFunnel.steps.${r.step}`)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
