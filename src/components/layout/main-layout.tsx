'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/layout/top-bar';
import type { User, Workspace } from '@prisma/client';
import BottomNavBar from './bottom-nav-bar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import TendyRain from '@/components/effects/TendyRain';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias'> | null;

export function MainLayout({ children, user, workspace }: { children: React.ReactNode; user: UserProp; workspace: Workspace | null }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { tendyRainActive, screenShakeActive } = useAppStore();

  const publicPaths = ['/login', '/register', '/validator', '/pricing', '/subscribe'];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p));

  // If it's a public page like login, just render the content without the main app layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // The main application layout for authenticated pages
  return (
    <div className={cn(
        "flex flex-col h-screen p-2 sm:p-4 gap-2 sm:gap-4",
        screenShakeActive && 'animate-screen-shake'
    )}>
      <TopBar user={user} workspace={workspace} />
      <main className={cn(
        "flex-grow flex flex-col min-h-0 overflow-y-auto",
        isMobile && 'pb-16' // Add padding to the bottom to avoid overlap with the nav bar
      )}>
        {children}
      </main>
      {isMobile && <BottomNavBar />}
      {tendyRainActive && <TendyRain />}
    </div>
  );
}
