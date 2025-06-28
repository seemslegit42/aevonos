'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopBar from '@/components/layout/top-bar';
import type { User } from '@prisma/client';

const BeepAvatar = dynamic(() => import('@/components/beep-avatar'), { 
  loading: () => <div className="fixed bottom-6 right-6 z-50 w-28 h-28" />
});

type UserProp = Pick<User, 'email' | 'firstName' | 'lastName'> | null;

export function MainLayout({ children, user }: { children: React.ReactNode; user: UserProp }) {
  const pathname = usePathname();

  const publicPaths = ['/login', '/register', '/validator'];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p));

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar user={user} />
      <main className="flex-grow flex flex-col min-h-0 overflow-y-auto">
        {children}
      </main>
      <BeepAvatar />
    </div>
  );
}
