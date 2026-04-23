import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminPlans from './AdminPlans';
import AdminStatuses from './AdminStatuses';

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="statuses">Statuses</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><AdminOverview /></TabsContent>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="plans"><AdminPlans /></TabsContent>
        <TabsContent value="statuses"><AdminStatuses /></TabsContent>
      </Tabs>
    </div>
  );
}
