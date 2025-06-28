
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { MainLayout } from '@/components/layout/main-layout';
import { getServerActionSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { User, Workspace } from '@prisma/client';

export const metadata: Metadata = {
  title: 'ΛΞVON OS',
  description: 'An agentic operating system interface.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: User | null = null;
  let workspace: Workspace | null = null;

  try {
    const session = await getServerActionSession();
    if (session?.userId && session?.workspaceId) {
        // Fetch user and workspace in parallel
        [user, workspace] = await Promise.all([
            prisma.user.findUnique({
                where: { id: session.userId },
                 select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
            }),
            prisma.workspace.findUnique({
                where: { id: session.workspaceId }
            })
        ]);
    }
  } catch (error) {
    console.error('[RootLayout] Failed to get session data, possibly a database connection issue:', error);
    // Proceed with null user/workspace, allowing the app to render in a logged-out state.
  }


  return (
    <html lang="en" className="dark">
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
        </div>
        
        <MainLayout user={user} workspace={workspace}>
          {children}
        </MainLayout>

        <Toaster />
      </body>
    </html>
  );
}
