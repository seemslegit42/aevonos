
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboardTab from './admin-console/AdminDashboardTab';
import UserManagementTab from './admin-console/UserManagementTab';
import SystemMonitoringTab from './admin-console/SystemMonitoringTab';

export default function AdminConsole() {
  return (
    <div className="p-2 h-full">
      <Tabs defaultValue="dashboard" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Overlook</TabsTrigger>
          <TabsTrigger value="pantheon">Pantheon</TabsTrigger>
          <TabsTrigger value="muster">Agent Muster</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="flex-grow mt-2 overflow-y-auto">
          <AdminDashboardTab />
        </TabsContent>
        <TabsContent value="pantheon" className="flex-grow mt-2 overflow-y-auto">
          <UserManagementTab />
        </TabsContent>
        <TabsContent value="muster" className="flex-grow mt-2 overflow-y-auto">
          <SystemMonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
