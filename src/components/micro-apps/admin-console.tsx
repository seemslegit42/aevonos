
'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboardTab from './admin-console/AdminDashboardTab';
import UserManagementTab from './admin-console/UserManagementTab';
import SystemMonitoringTab from './admin-console/SystemMonitoringTab';
import { type User, type Workspace, UserRole } from '@prisma/client';
import { Skeleton } from '../ui/skeleton';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import SacredVowsTab from './admin-console/SacredVowsTab';
import CovenantsTab from './admin-console/CovenantsTab';

export default function AdminConsole() {
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const [userRes, workspaceRes] = await Promise.all([
            fetch('/api/users/me'),
            fetch('/api/workspaces/me')
        ]);
        if (!userRes.ok || !workspaceRes.ok) {
          throw new Error('Could not verify user permissions');
        }
        const userData: User = await userRes.json();
        const workspaceData: Workspace = await workspaceRes.json();
        
        setIsOwner(userData.id === workspaceData.ownerId);

      } catch (e) {
        console.error("Failed to get user permissions for Admin Console", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPermissions();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 h-full">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md bg-destructive/10">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied by Decree</AlertTitle>
          <AlertDescription>
            You lack the necessary authority to gaze upon the Pantheon. This sanctum is for the Architect alone.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-2 h-full">
      <Tabs defaultValue="dashboard" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Overlook</TabsTrigger>
          <TabsTrigger value="pantheon">Pantheon</TabsTrigger>
          <TabsTrigger value="muster">Agent Muster</TabsTrigger>
          <TabsTrigger value="vows">Sacred Vows</TabsTrigger>
          <TabsTrigger value="covenants">Covenants</TabsTrigger>
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
        <TabsContent value="vows" className="flex-grow mt-2 overflow-y-auto">
          <SacredVowsTab />
        </TabsContent>
        <TabsContent value="covenants" className="flex-grow mt-2 overflow-y-auto">
          <CovenantsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
