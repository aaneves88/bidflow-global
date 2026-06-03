import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Item {
  id: string;
  href?: string;
}
interface Section {
  key: string;
  items: Item[];
}

const SECTIONS: Section[] = [
  { key: 'auth', items: [
    { id: 'signup' }, { id: 'login' }, { id: 'logout' }, { id: 'firstAdmin' },
  ]},
  { key: 'trial', items: [
    { id: 'trialGranted', href: '/admin?tab=users' },
    { id: 'trialBlocks' },
    { id: 'adminExtend', href: '/admin?tab=users' },
  ]},
  { key: 'plans', items: [
    { id: 'starterExists', href: '/admin?tab=plans' },
    { id: 'editPlan', href: '/admin?tab=plans' },
    { id: 'pricingShows', href: '/pricing' },
  ]},
  { key: 'stripe', items: [
    { id: 'integrationSaves', href: '/admin?tab=integrations' },
    { id: 'priceMapped', href: '/admin?tab=integrations' },
    { id: 'webhookConfigured' },
    { id: 'testCheckout', href: '/pricing' },
    { id: 'planActivates' },
  ]},
  { key: 'clients', items: [
    { id: 'createClient', href: '/clients' },
    { id: 'editClient', href: '/clients' },
    { id: 'searchClient', href: '/clients' },
  ]},
  { key: 'proposals', items: [
    { id: 'createProposal', href: '/proposals' },
    { id: 'editProposal', href: '/proposals' },
    { id: 'statusHistory' },
    { id: 'validUntil' },
  ]},
  { key: 'sharing', items: [
    { id: 'copyLink' },
    { id: 'whatsappOpens' },
    { id: 'publicLoads' },
    { id: 'viewCounted' },
    { id: 'acceptFlow' },
  ]},
  { key: 'pdf', items: [
    { id: 'pdfOwner' },
    { id: 'pdfPublic' },
  ]},
  { key: 'i18n', items: [
    { id: 'switchLang' },
    { id: 'noMissing' },
  ]},
  { key: 'mobile', items: [
    { id: 'mobileLayouts' },
  ]},
  { key: 'monetization', items: [
    { id: 'freeFirstProposal', href: '/proposals' },
    { id: 'secondTriggersModal', href: '/proposals' },
    { id: 'planUnblocks' },
    { id: 'adminUnlimited' },
    { id: 'manualGrant', href: '/admin?tab=users' },
    { id: 'usageDashboard', href: '/dashboard' },
    { id: 'usageProposals', href: '/proposals' },
  ]},
];

export default function AdminQAChecklist() {
  const { t } = useTranslation('admin');
  const { user } = useAuth();
  const storageKey = `closeflow_qa_${user?.id ?? 'anon'}`;

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch { /* noop */ }
  }, [storageKey]);

  const update = (key: string, val: boolean) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: val };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };

  const reset = () => {
    setChecked({});
    try { localStorage.removeItem(storageKey); } catch { /* noop */ }
  };

  const { total, done, percent } = useMemo(() => {
    const all = SECTIONS.flatMap((s) => s.items.map((i) => `${s.key}.${i.id}`));
    const d = all.filter((k) => checked[k]).length;
    return { total: all.length, done: d, percent: Math.round((d / all.length) * 100) };
  }, [checked]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('qa.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('qa.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={percent === 100 ? 'default' : 'outline'}>{done}/{total}</Badge>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="mr-2 h-3 w-3" /> {t('qa.reset')}
          </Button>
        </div>
      </div>

      <Progress value={percent} />

      <div className="grid gap-4">
        {SECTIONS.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="text-base">{t(`qa.sections.${section.key}.title`)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => {
                const key = `${section.key}.${item.id}`;
                return (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox
                      id={key}
                      checked={!!checked[key]}
                      onCheckedChange={(v) => update(key, v === true)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={key} className="text-sm font-medium cursor-pointer">
                        {t(`qa.sections.${section.key}.items.${item.id}.title`)}
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t(`qa.sections.${section.key}.items.${item.id}.desc`)}
                      </p>
                    </div>
                    {item.href && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={item.href}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
