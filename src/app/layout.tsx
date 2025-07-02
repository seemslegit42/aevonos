

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { MainLayout } from '@/components/layout/main-layout';
import { type User, type Workspace, UserPsyche, Prisma } from '@prisma/client';
import { cn } from '@/lib/utils';
import { FirstWhisperHandler } from '@/components/layout/FirstWhisperHandler';
import Image from 'next/image';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'ΛΞVON OS',
  description: 'An agentic operating system interface.',
};

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias' | 'psyche' | 'firstWhisper'> | null;

const psycheToCovenantClass: Record<UserPsyche, string> = {
  [UserPsyche.SYNDICATE_ENFORCER]: 'theme-covenant-motion',
  [UserPsyche.RISK_AVERSE_ARTISAN]: 'theme-covenant-worship',
  [UserPsyche.ZEN_ARCHITECT]: 'theme-covenant-silence',
}

const themeCardMap: Record<string, string> = {
  'ACROPOLIS_MARBLE': 'theme-acropolis-marble',
  'NOCTUAS_GAZE': 'theme-covenant-silence', // Re-using the silence theme for its pure black feel
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: UserProp = null;
  let workspace: Workspace | null = null;
  let themeClass = '';

  try {
    const session = await getSession();
    if (session) {
        user = session;
        // Mock workspace to prevent DB call during render failures
        workspace = {
            id: session.workspaceId,
            name: 'Primary Canvas',
            ownerId: user.id,
            planTier: 'Artisan',
            credits: new Prisma.Decimal(1337.42),
            agentActionsUsed: 138,
            unlockedAppIds: ['winston-wolfe', 'dr-syntax', 'lahey-surveillance', 'kif-kroker', 'lucille-bluth', 'project-lumbergh', 'vandelay', 'rolodex', 'stonks-bot'],
            overageEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const activeEffect = null; // Mock active effect
        
        const activeTheme = activeEffect ? themeCardMap[activeEffect.cardKey] : undefined;

        if (activeTheme) {
          themeClass = activeTheme;
        } else if (user?.psyche) {
          themeClass = psycheToCovenantClass[user.psyche] || '';
        }
    }
  } catch (error) {
    console.error('[RootLayout] Failed to get session data, possibly a database connection issue:', error);
  }


  return (
    <html lang="en" className={cn("dark", themeClass)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&family=Inconsolata:wght@400;700&family=Lexend:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased relative min-h-screen">
        <div className="absolute top-0 z-[-2] h-screen w-full bg-background">
          <div 
            className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
          />
          <div 
            className="absolute inset-0 animate-aurora bg-[linear-gradient(135deg,hsl(var(--iridescent-one)/0.2),hsl(var(--iridescent-two)/0.2)_50%,hsl(var(--iridescent-three)/0.2)_100%)] bg-[length:600%_600%]"
          />
          <div className="absolute inset-0 grain-overlay" />
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none -z-10">
                <Image 
                    src="/logo.png" 
                    alt="Aevon OS Watermark"
                    width={512}
                    height={512}
                    priority
                    className="object-contain animate-subtle-pulse"
                />
          </div>
        </div>
        
        <MainLayout user={user} workspace={workspace}>
          {children}
        </MainLayout>

        <FirstWhisperHandler user={user} />
        <Toaster />
      </body>
    </html>
  );
}
