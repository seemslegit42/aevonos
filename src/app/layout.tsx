
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { MainLayout } from '@/components/layout/main-layout';
import Image from 'next/image';
import { AuthProvider } from '@/context/AuthContext';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getUserVas } from './user/actions';


export const metadata: Metadata = {
  title: 'ΛΞVON OS',
  description: 'An agentic operating system interface.',
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const { user, workspace } = await getAuthenticatedUser().catch(() => ({ user: null, workspace: null }));
  
  let initialVas: number | null = null;
  if (user) {
    initialVas = await getUserVas().catch(() => null);
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&family=Lexend:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased relative min-h-screen">
        <AuthProvider>
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
            
            <MainLayout user={user} workspace={workspace} initialVas={initialVas}>
                {children}
            </MainLayout>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
