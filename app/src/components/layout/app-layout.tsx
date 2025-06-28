'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@prisma/client';

const MainLayout = dynamic(() => 
  import('@/components/layout/main-layout').then((mod) => mod.MainLayout), 
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-screen p-4 gap-4">
        <Skeleton className="h-[68px] w-full" />
        <div className="flex-grow">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    ),
  }
);

type UserProp = Pick<User, 'email' | 'firstName' | 'lastName'> | null;

export function AppLayout({ children, user }: { children: React.ReactNode, user: UserProp }) {
  const pathname = usePathname();

  // Define public paths that don't need the main authenticated layout
  const publicPaths = ['/login', '/register', '/validator'];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p));

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <MainLayout user={user}>
        {children}
    </MainLayout>
  );
}
