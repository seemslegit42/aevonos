
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ListCollapse, History } from 'lucide-react';

interface LoomMobileToolbarProps {
  onAddNodeClick: () => void;
  onWorkflowsClick: () => void;
  onHistoryClick: () => void;
}

export default function LoomMobileToolbar({
  onAddNodeClick,
  onWorkflowsClick,
  onHistoryClick,
}: LoomMobileToolbarProps) {
  return (
    <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 w-fit p-1 flex items-center gap-1 bg-background/80 backdrop-blur-md border rounded-full shadow-lg z-40">
      <Button variant="ghost" size="icon" onClick={onWorkflowsClick}>
        <ListCollapse className="h-5 w-5" />
        <span className="sr-only">Workflows</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onAddNodeClick}>
        <Plus className="h-5 w-5" />
        <span className="sr-only">Add Node</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onHistoryClick}>
        <History className="h-5 w-5" />
        <span className="sr-only">History</span>
      </Button>
    </div>
  );
}
