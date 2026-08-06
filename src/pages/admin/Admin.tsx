import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminPlans from './AdminPlans';
import AdminStatuses from './AdminStatuses';
import AdminIntegrations from './AdminIntegrations';
import AdminQAChecklist from './AdminQAChecklist';
import AdminRoadmap from './AdminRoadmap';
import AdminSupport from './AdminSupport';

export default function Admin() {
  const { t } = useTranslation('admin');
  const { t: tSupport } = useTranslation('support');
  const tabsListRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const container = tabsListRef.current;
    if (!container) return;

    const active = container.querySelector('[role="tab"][data-state="active"]') as HTMLElement | null;
    if (!active) return;

    active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [tab]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList
          ref={tabsListRef}
          className="relative flex w-full justify-start overflow-x-auto rounded-md bg-muted p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
          <TabsTrigger value="plans">{t('tabs.plans')}</TabsTrigger>
          <TabsTrigger value="statuses">{t('tabs.statuses')}</TabsTrigger>
          <TabsTrigger value="integrations">{t('tabs.integrations')}</TabsTrigger>
          <TabsTrigger value="qa">{t('tabs.qa')}</TabsTrigger>
          <TabsTrigger value="roadmap">{t('tabs.roadmap')}</TabsTrigger>
          <TabsTrigger value="support">{tSupport('admin.title')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><AdminOverview /></TabsContent>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="plans"><AdminPlans /></TabsContent>
        <TabsContent value="statuses"><AdminStatuses /></TabsContent>
        <TabsContent value="integrations"><AdminIntegrations /></TabsContent>
        <TabsContent value="qa"><AdminQAChecklist /></TabsContent>
        <TabsContent value="roadmap"><AdminRoadmap /></TabsContent>
        <TabsContent value="support"><AdminSupport /></TabsContent>

      </Tabs>
    </div>
  );
}


