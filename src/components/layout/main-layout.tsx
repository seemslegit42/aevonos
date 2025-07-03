
'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopBar from '@/components/layout/top-bar';
import type { User, Workspace } from '@prisma/client';
import BottomNavBar from './bottom-nav-bar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { NudgeHandler } from './NudgeHandler';
import { useAuth } from '@/context/AuthContext';
import { FirstWhisperHandler } from './FirstWhisperHandler';
import { Skeleton } from '../ui/skeleton';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: firebaseUser, loading } = useAuth();
  
  const [dbUser, setDbUser] = React.useState<User | null>(null);
  const [workspace, setWorkspace] = React.useState<Workspace | null>(null);
  const [isDataLoading, setIsDataLoading] = React.useState(true);

  useEffect(() => {
    async function fetchUserData() {
        if (firebaseUser) {
            setIsDataLoading(true);
            try {
                const [userRes, workspaceRes] = await Promise.all([
                    fetch('/api/users/me'),
                    fetch('/api/workspaces/me')
                ]);
                if (userRes.ok && workspaceRes.ok) {
                    const userData = await userRes.json();
                    const workspaceData = await workspaceRes.json();
                    setDbUser(userData);
                    setWorkspace(workspaceData);
                } else if (userRes.status === 404 && pathname !== '/register/vow') {
                    // User exists in Firebase but not in our DB, and they are not on the vow page.
                    // This means they need to complete onboarding.
                    router.push('/register/vow');
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setIsDataLoading(false);
            }
        } else {
            setIsDataLoading(false);
        }
    }
    if (!loading) {
        fetchUserData();
    }
  }, [firebaseUser, loading, pathname, router]);


  const isMobile = useIsMobile();
  const publicPaths = ['/login', '/register', '/pricing'];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p));
  
  useEffect(() => {
    if (!loading && !firebaseUser && !isPublicPage) {
        router.push('/login');
    }
  }, [loading, firebaseUser, isPublicPage, router]);

  if (loading || (isDataLoading && !isPublicPage)) {
      return (
          <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-shrink-0 p-2 sm:p-4">
                <Skeleton className="h-14 w-full" />
            </div>
            <main className="flex-grow p-4">
                 <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 p-4 pt-20">
                    <div className="col-span-12 row-span-6 lg:col-span-3 lg:row-span-6 z-10">
                        <div className="h-full w-full grid grid-rows-3 gap-4">
                        <Skeleton className="h-full w-full" />
                        <Skeleton className="h-full w-full" />
                        <Skeleton className="h-full w-full" />
                        </div>
                    </div>
                    <div className="col-span-12 row-span-6 lg:col-span-6 lg:row-span-6" />
                    <div className="col-span-12 row-span-6 lg:col-span-3 lg:row-span-6 z-10">
                        <div className="h-full w-full grid grid-rows-3 gap-4">
                            <Skeleton className="h-full w-full" />
                            <div className="row-span-2"><Skeleton className="h-full w-full" /></div>
                        </div>
                    </div>
                 </div>
            </main>
          </div>
      )
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-shrink-0 p-2 sm:p-4">
        <TopBar user={dbUser} workspace={workspace} />
      </div>
      <main className={cn(
        "flex-grow flex flex-col min-h-0",
        isMobile && 'pb-20'
      )}>
        {children}
      </main>
      {isMobile && <BottomNavBar />}
      <FirstWhisperHandler user={dbUser} />
      <NudgeHandler />
    </div>
  );
}
