import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'ΛΞVON OS',
  description: 'An agentic operating system interface.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&family=Lexend:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased relative min-h-screen">
        <div className="absolute top-0 z-[-2] h-screen w-full bg-background">
           <div 
            className="absolute inset-0 bg-[url(https://res.cloudinary.com/delba/image/upload/v1698222956/gradient.png)] bg-cover opacity-10"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
          />
          <div 
            className="absolute inset-0 animate-aurora bg-[linear-gradient(135deg,hsl(var(--primary)/0.2),hsl(var(--accent)/0.2)_50%,hsl(var(--primary)/0.2)_100%)] bg-[length:400%_400%]"
          />
        </div>
        
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
