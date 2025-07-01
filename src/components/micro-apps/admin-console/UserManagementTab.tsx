
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { User } from '@prisma/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

import { Button } from '@/components/ui/button';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UserCard from './UserCard';
import UserStar from './UserStar';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt' | 'psyche' | 'agentAlias'>;

const Scene = ({ users, onActionComplete, currentUserId }: { users: UserData[], onActionComplete: () => void, currentUserId: string }) => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const positions = useMemo(() => {
        const temp: [number, number, number][] = [];
        const numUsers = users.length;
        if (numUsers === 0) return temp;
        
        for (let i = 0; i < numUsers; i++) {
            const phi = Math.acos(-1 + (2 * i) / (numUsers-1));
            const theta = Math.sqrt(numUsers * Math.PI) * phi;
            const r = 5 + (i/numUsers) * 5;
            temp.push([r * Math.cos(theta) * Math.sin(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(phi)]);
        }
        return temp;
    }, [users]);
    
    const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);
    const selectedUserIndex = useMemo(() => users.findIndex(u => u.id === selectedUserId), [users, selectedUserId]);

    return (
        <Suspense fallback={null}>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

            {users.map((user, i) => (
                <UserStar
                    key={user.id}
                    user={user}
                    position={positions[i]}
                    isSelected={selectedUserId === user.id}
                    onClick={() => setSelectedUserId(user.id)}
                />
            ))}
            
            {selectedUser && selectedUserIndex !== -1 && (
                <Html position={positions[selectedUserIndex]} center>
                    <div className="w-80 -translate-x-1/2 translate-y-12">
                         <UserCard user={selectedUser} currentUserId={currentUserId} onActionComplete={() => {
                             setSelectedUserId(null); // Deselect on action
                             onActionComplete();
                         }} />
                    </div>
                </Html>
            )}

            <OrbitControls autoRotate autoRotateSpeed={0.2} enablePan={false} enableZoom={true} />
        </Suspense>
    );
};

export default function UserManagementTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchUsersAndSession() {
      setIsLoading(true);
      setError(null);
      try {
        const [usersResponse, sessionResponse] = await Promise.all([
           fetch('/api/admin/users'),
           fetch('/api/users/me')
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
        <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg" />
        </div>
      );
    }
    
    if (error) {
        return <div className="w-full h-full flex items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>;
    }

    if (users.length === 0) {
        return <div className="w-full h-full flex items-center justify-center p-4">
            <p className="text-center text-muted-foreground">The Pantheon is empty.</p>
        </div>;
    }
    
    return (
       <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
           <Scene users={users} onActionComplete={handleActionComplete} currentUserId={currentUserId!} />
       </Canvas>
    );
  }

  return (
    <div className="p-2 space-y-2 h-full flex flex-col">
      <div className="flex justify-end flex-shrink-0">
        <Button disabled><UserPlus className="mr-2" />Invite Soul</Button>
      </div>
      <div className="flex-grow rounded-lg overflow-hidden relative border">
         {renderContent()}
      </div>
    </div>
  );
}
