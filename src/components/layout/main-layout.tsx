
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/layout/top-bar';
import type { User, Workspace } from '@prisma/client';
import BottomNavBar from './bottom-nav-bar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { NudgeHandler } from './NudgeHandler';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias' | 'psyche' | 'firstWhisper'> | null;

export function MainLayout({ children, user, workspace }: { children: React.ReactNode; user: UserProp; workspace: Workspace | null }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const publicPaths = ['/login', '/register', '/pricing'];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p));

  // If it's a public page like login, just render the content without the main app layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // The main application layout for authenticated pages
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-shrink-0 p-2 sm:p-4">
        <TopBar user={user} workspace={workspace} />
      </div>
      <main className={cn(
        "flex-grow flex flex-col min-h-0",
        isMobile && 'pb-20' // Add padding to the bottom to avoid overlap with the nav bar
      )}>
        {children}
      </main>
      {isMobile && <BottomNavBar />}
      <NudgeHandler />
    </div>
  );
}
