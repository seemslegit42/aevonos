'use client';

import TopBar from '@/components/layout/top-bar';
import { useAppStore } from '@/store/app-store';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, handleCommandSubmit } = useAppStore();

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar onCommandSubmit={handleCommandSubmit} isLoading={isLoading} />
      <main className="flex-grow flex flex-col min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
