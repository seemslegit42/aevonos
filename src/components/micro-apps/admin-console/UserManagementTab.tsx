
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@prisma/client';
import UserCard from './UserCard';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt' | 'psyche' | 'agentAlias'>;

const UserCardSkeleton = () => (
    <div className="bg-background/50 flex flex-col p-4 rounded-lg border border-foreground/20 space-y-3">
        <div className="flex flex-row items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-auto">
            <Skeleton className="h-3 w-1/3" />
        </div>
    </div>
);


export default function UserManagementTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchUsersAndSession() {
      setIsLoading(true);
      try {
        const [usersResponse, sessionResponse] = await Promise.all([
           fetch('/api/admin/users'),
           fetch('/api/users/me') // Fetch current user to get their ID
        ]);

        if (!usersResponse.ok) {
            const errorData = await usersResponse.json();
            throw new Error(errorData.error || 'Failed to fetch users.');
        }
        if (!sessionResponse.ok) {
            throw new Error('Could not identify current user.');
        }

        const usersData = await usersResponse.json();
        const sessionData = await sessionResponse.json();

        setUsers(usersData);
        setCurrentUserId(sessionData.id);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsersAndSession();
  }, [refreshKey]);
  
  const handleActionComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <UserCardSkeleton key={i} />)}
        </div>
      );
    }
    
    if (error) {
        return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
    }
    
    if (users.length === 0) {
        return <p className="text-center text-muted-foreground">No users found in this Pantheon.</p>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
                <UserCard key={user.id} user={user} currentUserId={currentUserId!} onActionComplete={handleActionComplete} />
            ))}
        </div>
    )
  }

  return (
    <div className="p-2 space-y-4">
      <div className="flex justify-end">
        <Button disabled><UserPlus className="mr-2" />Invite Soul</Button>
      </div>
      {renderContent()}
    </div>
  );
}
