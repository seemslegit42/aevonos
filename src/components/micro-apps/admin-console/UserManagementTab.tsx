
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { User, UserPsyche } from '@prisma/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';

import { Button } from '@/components/ui/button';
import { UserPlus, AlertTriangle, List, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UserCard from './UserCard';
import UserStar from './UserStar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import UserRosterTable from './UserRosterTable';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt' | 'psyche' | 'agentAlias'>;
type ViewMode = 'pantheon' | 'roster';

const generateSpherePositions = (count: number, radius: number, center: [number, number, number]): [number, number, number][] => {
    const points: [number, number, number][] = [];
    if (count === 0) return points;
    
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / (count-1 || 1));
        const theta = Math.sqrt((count-1 || 1) * Math.PI) * phi;
        
        const x = center[0] + radius * Math.cos(theta) * Math.sin(phi);
        const y = center[1] + radius * Math.sin(theta) * Math.sin(phi);
        const z = center[2] + radius * Math.cos(phi);
        points.push([x, y, z]);
    }
    return points;
};

const PantheonView = ({ users, onActionComplete, currentUserId }: { users: UserData[], onActionComplete: () => void, currentUserId: string }) => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const { motionUsers, worshipUsers, silenceUsers } = useMemo(() => {
        const groups: { motion: UserData[], worship: UserData[], silence: UserData[] } = { motion: [], worship: [], silence: [] };
        users.forEach(user => {
            if (user.psyche === UserPsyche.SYNDICATE_ENFORCER) groups.motion.push(user);
            else if (user.psyche === UserPsyche.RISK_AVERSE_ARTISAN) groups.worship.push(user);
            else groups.silence.push(user);
        });
        return { motionUsers: groups.motion, worshipUsers: groups.worship, silenceUsers: groups.silence };
    }, [users]);

    const motionPositions = useMemo(() => generateSpherePositions(motionUsers.length, 3, [-8, 2, 0]), [motionUsers]);
    const worshipPositions = useMemo(() => generateSpherePositions(worshipUsers.length, 3, [8, 2, 0]), [worshipUsers]);
    const silencePositions = useMemo(() => generateSpherePositions(silenceUsers.length, 3, [0, -6, 0]), [silenceUsers]);

    const allPositionedUsers = [
        ...motionUsers.map((u, i) => ({ user: u, position: motionPositions[i] })),
        ...worshipUsers.map((u, i) => ({ user: u, position: worshipPositions[i] })),
        ...silenceUsers.map((u, i) => ({ user: u, position: silencePositions[i] })),
    ];
    
    const selectedUser = useMemo(() => allPositionedUsers.find(pu => pu.user.id === selectedUserId), [allPositionedUsers, selectedUserId]);

    return (
       <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
           <Suspense fallback={null}>
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 0, 0]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

                {allPositionedUsers.map(({ user, position }) => (
                     <UserStar
                        key={user.id}
                        user={user}
                        position={position}
                        isSelected={selectedUserId === user.id}
                        onClick={() => setSelectedUserId(user.id)}
                    />
                ))}
                
                {selectedUser && (
                    <Html position={selectedUser.position as any} center>
                        <div className="w-80 -translate-x-1/2 translate-y-48">
                            <UserCard user={selectedUser.user} currentUserId={currentUserId} onActionComplete={() => {
                                setSelectedUserId(null);
                                onActionComplete();
                            }} />
                        </div>
                    </Html>
                )}

                <OrbitControls autoRotate autoRotateSpeed={0.2} enablePan={false} enableZoom={true} />
            </Suspense>
       </Canvas>
    );
};

export default function UserManagementTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('pantheon');

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
    
    if (viewMode === 'roster') {
        return <UserRosterTable users={users} currentUserId={currentUserId!} onActionComplete={handleActionComplete} />;
    }
    
    return <PantheonView users={users} onActionComplete={handleActionComplete} currentUserId={currentUserId!} />;
  }

  return (
    <div className="p-2 space-y-2 h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value: ViewMode) => value && setViewMode(value)}>
            <ToggleGroupItem value="pantheon" aria-label="Pantheon View"><Star className="h-4 w-4 mr-2"/>Pantheon</ToggleGroupItem>
            <ToggleGroupItem value="roster" aria-label="Roster View"><List className="h-4 w-4 mr-2"/>Roster</ToggleGroupItem>
          </ToggleGroup>
          <Button disabled><UserPlus className="mr-2" />Invite Soul</Button>
      </div>
      <div className="flex-grow rounded-lg overflow-hidden relative border">
         {renderContent()}
      </div>
    </div>
  );
}
