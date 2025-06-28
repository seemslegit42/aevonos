
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopBar from '@/components/layout/top-bar';
import type { User } from '@prisma/client';
import { Skeleton } from '../ui/skeleton';
import { useAppStore } from '@/store/app-store';

const BeepAvatar = dynamic(() => import('@/components/beep-avatar'), { 
  ssr: false,
});

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> | null;

export function MainLayout({ children, user }: { children: React.ReactNode; user: UserProp }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, beepOutput } = useAppStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const publicPaths = ['/login', '/register', '/validator'];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p));

  if (isPublicPage) {
    return <>{children}</>;
  }

  const renderContent = () => {
    if (!isMounted) {
      return (
        <div className="flex-grow p-4 rounded-lg">
          <Skeleton className="w-full h-full" />
        </div>
      );
    }
    return children;
  }

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar user={user} />
      <main className="flex-grow flex flex-col min-h-0 overflow-y-auto">
        {renderContent()}
      </main>
      <BeepAvatar isLoading={isLoading} beepOutput={beepOutput} />
    </div>
  );
}
