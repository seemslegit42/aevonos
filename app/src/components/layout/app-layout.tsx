'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

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


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define public paths that don't need the main authenticated layout
  const publicPaths = ['/login', '/register', '/validator'];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p));

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <MainLayout>
        {children}
    </MainLayout>
  );
}
