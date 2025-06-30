'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboardTab from './admin-console/AdminDashboardTab';
import UserManagementTab from './admin-console/UserManagementTab';
import SystemMonitoringTab from './admin-console/SystemMonitoringTab';
import { type User, UserRole } from '@prisma/client';
import { Skeleton } from '../ui/skeleton';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function AdminConsole() {
  const [user, setUser] = useState<Pick<User, 'role'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const res = await fetch('/api/users/me');
        if (!res.ok) {
          throw new Error('Could not fetch user permissions');
        }
        const userData: Pick<User, 'role'> = await res.json();
        setUser(userData);
      } catch (e) {
        console.error("Failed to get user role for Admin Console", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserRole();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 h-full">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (user?.role !== UserRole.ADMIN) {
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
