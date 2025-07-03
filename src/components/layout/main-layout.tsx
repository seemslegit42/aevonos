
'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopBar from '@/components/layout/top-bar';
import type { User, Workspace, UserPsyche } from '@prisma/client';
import BottomNavBar from './bottom-nav-bar';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { cn } from '@/lib/utils';
import { NudgeHandler } from './NudgeHandler';
import { useAuth } from '@/context/AuthContext';
import { FirstWhisperHandler } from './FirstWhisperHandler';
import { Skeleton } from '../ui/skeleton';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User | null;
  workspace: Workspace | null;
}

export function MainLayout({ children, user: dbUser, workspace }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  
  const isPublicPage = ['/login', '/register', '/pricing'].some(p => pathname.startsWith(p));
  const needsOnboarding = firebaseUser && !dbUser && !authLoading && pathname !== '/register/vow';

  useEffect(() => {
    // If the user is authenticated with Firebase but has no DB record, they need to complete the Rite.
    if (needsOnboarding) {
      router.push('/register/vow');
    }
    // If the user isn't authenticated and is not on a public page, they need to sign in.
    else if (!authLoading && !firebaseUser && !isPublicPage) {
      router.push('/login');
    }
  }, [authLoading, firebaseUser, isPublicPage, needsOnboarding, pathname, router]);


  useEffect(() => {
    const psycheToTheme: Record<UserPsyche, string> = {
      [UserPsyche.SYNDICATE_ENFORCER]: 'theme-covenant-motion',
      [UserPsyche.RISK_AVERSE_ARTISAN]: 'theme-covenant-worship',
      [UserPsyche.ZEN_ARCHITECT]: 'theme-covenant-silence',
    };
    
    if (dbUser?.psyche) {
      const themeClass = psycheToTheme[dbUser.psyche];
      document.documentElement.className = `dark ${themeClass}`;
    } else {
      document.documentElement.className = 'dark'; // Default theme
    }
  }, [dbUser]);


  // While checking auth state, show a skeleton.
  if (authLoading && !isPublicPage) {
      return (
          <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-shrink-0 p-2 sm:p-4">
                <Skeleton className="h-14 w-full" />
            </div>
            <main className="flex-grow p-4"></main>
          </div>
      )
  }
  
  // If user is on a public page, or needs to onboard, or isn't signed in, render only the children (e.g., the login page)
  if (isPublicPage || needsOnboarding || (!firebaseUser && !authLoading)) {
    return <>{children}</>;
  }
  
  const isMobile = useIsMobile();
  
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
