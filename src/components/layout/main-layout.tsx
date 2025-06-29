'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/layout/top-bar';
import type { User, Workspace, UserRole, UserRank } from '@prisma/client';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'rank' | 'xp'> | null;

export function MainLayout({ children, user, workspace }: { children: React.ReactNode; user: UserProp; workspace: Workspace | null }) {
  const pathname = usePathname();

  const publicPaths = ['/login', '/register', '/validator'];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p));

  // If it's a public page like login, just render the content without the main app layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // The main application layout for authenticated pages
  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar user={user} workspace={workspace} />
      <main className="flex-grow flex flex-col min-h-0 overflow-y-auto">
        {/* Render children directly. Client/Server rendering is handled by the page. */}
        {children}
      </main>
    </div>
  );
}
