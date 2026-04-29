import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminPlans from './AdminPlans';
import AdminStatuses from './AdminStatuses';
import AdminIntegrations from './AdminIntegrations';

export default function Admin() {
  const { t } = useTranslation('admin');
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
          <TabsTrigger value="plans">{t('tabs.plans')}</TabsTrigger>
          <TabsTrigger value="statuses">{t('tabs.statuses')}</TabsTrigger>
          <TabsTrigger value="integrations">{t('tabs.integrations')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><AdminOverview /></TabsContent>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="plans"><AdminPlans /></TabsContent>
        <TabsContent value="statuses"><AdminStatuses /></TabsContent>
        <TabsContent value="integrations"><AdminIntegrations /></TabsContent>
      </Tabs>
    </div>
  );
}
