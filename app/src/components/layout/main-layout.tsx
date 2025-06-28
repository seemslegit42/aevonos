'use client';

import React, { useEffect, useRef } from 'react';
import TopBar from '@/components/layout/top-bar';
import { useAppStore } from '@/store/app-store';
import dynamic from 'next/dynamic';
import type { User } from '@prisma/client';

const BeepAvatar = dynamic(() => import('@/components/beep-avatar'), { 
  ssr: false,
  loading: () => <div className="fixed bottom-6 right-6 z-50 w-28 h-28" />
});

type UserProp = Pick<User, 'email' | 'firstName' | 'lastName'> | null;

export function MainLayout({ children, user }: { children: React.ReactNode; user: UserProp }) {
  const { isLoading, handleCommandSubmit, beepOutput } = useAppStore();

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar onCommandSubmit={handleCommandSubmit} isLoading={isLoading} user={user} />
      <main className="flex-grow flex flex-col min-h-0 overflow-y-auto">
        {children}
      </main>
      <BeepAvatar isLoading={isLoading} beepOutput={beepOutput} />
    </div>
  );
}
