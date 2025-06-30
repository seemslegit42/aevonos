
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@prisma/client';
import UserCard from './UserCard';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt' | 'psyche' | 'agentAlias'>;

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
          throw new Error('You do not have permission to view users.');
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
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      );
    }
    
    if (error) {
        return <p className="text-center text-destructive">{error}</p>
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
