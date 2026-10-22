import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminPlans from './AdminPlans';
import AdminStatuses from './AdminStatuses';
import AdminIntegrations from './AdminIntegrations';
import AdminQAChecklist from './AdminQAChecklist';
import AdminRoadmap from './AdminRoadmap';
import AdminSupport from './AdminSupport';
import AdminMarketing from './AdminMarketing';
import AdminBrand from './AdminBrand';
import AdminEbookLeads from './AdminEbookLeads';
import AdminReferrals from './AdminReferrals';
import AdminPartners from './AdminPartners';
import AdminNicheFunnel from './AdminNicheFunnel';
import AdminWeekly from './AdminWeekly';
import AdminVideos from './AdminVideos';
import AdminBroadcast from './AdminBroadcast';




const GROUPS: { key: string; tabs: string[] }[] = [
  { key: 'numbers', tabs: ['overview', 'weekly', 'niches'] },
  { key: 'people', tabs: ['users', 'support', 'leads'] },
  { key: 'sales', tabs: ['plans', 'referrals', 'partners'] },
  { key: 'marketing', tabs: ['marketing', 'videos', 'brand'] },
  { key: 'system', tabs: ['statuses', 'integrations', 'qa', 'roadmap'] },
];

const PANELS: Record<string, JSX.Element> = {
  overview: <AdminOverview />,
  weekly: <AdminWeekly />,
  niches: <AdminNicheFunnel />,
  users: <AdminUsers />,
  support: <AdminSupport />,
  leads: <AdminEbookLeads />,
  plans: <AdminPlans />,
  referrals: <AdminReferrals />,
  partners: <AdminPartners />,
  marketing: <AdminMarketing />,
  videos: <AdminVideos />,
  brand: <AdminBrand />,
  statuses: <AdminStatuses />,
  integrations: <AdminIntegrations />,
  qa: <AdminQAChecklist />,
  roadmap: <AdminRoadmap />,
};

export default function Admin() {
  const { t } = useTranslation('admin');
  const { t: tSupport } = useTranslation('support');
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab') || 'overview';
  const tab = PANELS[requested] ? requested : 'overview';
  const group = GROUPS.find((g) => g.tabs.includes(tab)) ?? GROUPS[0];

  const tabLabel = (key: string) => (key === 'support' ? tSupport('admin.title') : t(`tabs.${key}`));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <Tabs value={group.key} onValueChange={(g) => setSearchParams({ tab: GROUPS.find((x) => x.key === g)!.tabs[0] })}>
        <TabsList className="flex w-full justify-start overflow-x-auto [scrollbar-width:none]">
          {GROUPS.map((g) => (
            <TabsTrigger key={g.key} value={g.key}>{t(`groups.${g.key}`)}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList className="flex w-full justify-start overflow-x-auto bg-transparent p-0 gap-1 [scrollbar-width:none]">
          {group.tabs.map((k) => (
            <TabsTrigger key={k} value={k} className="rounded-full border data-[state=active]:border-primary">
              {tabLabel(k)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab}>{PANELS[tab]}</TabsContent>
      </Tabs>
    </div>
  );
}
