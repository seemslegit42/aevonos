
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopBar from '@/components/layout/top-bar';
import { type User, type Workspace, UserPsyche, type ActiveSystemEffect } from '@prisma/client';
import BottomNavBar from './bottom-nav-bar';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { cn } from '@/lib/utils';
import { NudgeHandler } from './NudgeHandler';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '../ui/skeleton';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User | null;
  workspace: Workspace | null;
  initialVas: number | null;
}

const psycheToTheme: Record<UserPsyche, string> = {
  [UserPsyche.SYNDICATE_ENFORCER]: 'theme-covenant-motion',
  [UserPsyche.RISK_AVERSE_ARTISAN]: 'theme-covenant-worship',
  [UserPsyche.ZEN_ARCHITECT]: 'theme-covenant-silence',
};

const effectToTheme: Record<string, string> = {
    'ACROPOLIS_MARBLE': 'theme-acropolis-marble',
    // Future themes can be added here
};


export function MainLayout({ children, user: dbUser, workspace, initialVas }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [activeEffects, setActiveEffects] = useState<ActiveSystemEffect[]>([]);
  
  const isPublicPage = ['/login', '/register', '/pricing'].some(p => pathname.startsWith(p));
  const isAuthActionPage = pathname === '/auth/action';
  const needsOnboarding = firebaseUser && !dbUser && !authLoading && !isPublicPage && pathname !== '/register/vow';

  useEffect(() => {
    // If the user is authenticated with Firebase but has no DB record, they need to complete the Rite.
    if (needsOnboarding) {
      router.push('/register/vow');
    }
    // If the user isn't authenticated and is not on a public page, they need to sign in.
    else if (!authLoading && !firebaseUser && !isPublicPage && !isAuthActionPage) {
      router.push('/login');
    }
  }, [authLoading, firebaseUser, isPublicPage, isAuthActionPage, needsOnboarding, pathname, router]);


  // Effect for fetching active system effects
  useEffect(() => {
    if (!dbUser) return;

    const fetchEffects = async () => {
      try {
        const res = await fetch('/api/workspaces/me/active-effects');
        if (res.ok) {
          const data = await res.json();
          setActiveEffects(data);
        }
      } catch (error) {
        console.error("Failed to fetch system effects:", error);
      }
    };
    
    fetchEffects();
    const interval = setInterval(fetchEffects, 30000); // Check for effects every 30 seconds
    return () => clearInterval(interval);

  }, [dbUser]);


  useEffect(() => {
    // Determine the active theme, with system effects taking priority
    const activeEffectKey = activeEffects[0]?.cardKey; // Get the most recent active effect
    const effectTheme = activeEffectKey ? effectToTheme[activeEffectKey] : null;

    const covenantTheme = dbUser?.psyche ? psycheToTheme[dbUser.psyche] : null;
    
    const finalTheme = effectTheme || covenantTheme || '';

    document.documentElement.className = `dark ${finalTheme}`.trim();
    
  }, [dbUser, activeEffects]);


  // While checking auth state, show a skeleton.
  if (authLoading && !isPublicPage && !isAuthActionPage) {
      return (
          <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-shrink-0 p-2 sm:p-4">
                <Skeleton className="h-14 w-full" />
            </div>
            <main className="flex-grow p-4"></main>
          </div>
      )
  }
  
  // If user is on a public page, or needs to onboard, or isn't signed in, render only the children
  if (isPublicPage || isAuthActionPage || needsOnboarding || (!firebaseUser && !authLoading)) {
    return <>{children}</>;
  }
  
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-shrink-0 p-2 sm:p-4">
        <TopBar user={dbUser} workspace={workspace} initialVas={initialVas} />
      </div>
      <main className={cn(
        "flex-grow flex flex-col min-h-0",
        isMobile && 'pb-20'
      )}>
        {children}
      </main>
      {isMobile && <BottomNavBar />}
      <NudgeHandler />
    </div>
  );
}
