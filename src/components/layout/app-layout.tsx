'use client';

import TopBar from '@/components/layout/top-bar';
import { useAppStore } from '@/store/app-store';
import dynamic from 'next/dynamic';

const BeepAvatar = dynamic(() => import('@/components/beep-avatar'), { 
  ssr: false,
  // Add a placeholder to prevent layout shift while the component loads
  loading: () => <div className="fixed bottom-6 right-6 z-50 w-28 h-28" />
});

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, handleCommandSubmit, beepOutput } = useAppStore();

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar onCommandSubmit={handleCommandSubmit} isLoading={isLoading} />
      <main className="flex-grow flex flex-col min-h-0 overflow-y-auto">
        {children}
      </main>
      <BeepAvatar isLoading={isLoading} beepOutput={beepOutput} />
    </div>
  );
}
