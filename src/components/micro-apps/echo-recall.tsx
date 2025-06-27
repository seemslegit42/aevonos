
'use client';

import React from 'react';
import type { SessionRecallOutput } from '@/ai/agents/echo-schemas';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EchoRecall({ summary, keyPoints }: SessionRecallOutput) {
  if (!summary && (!keyPoints || keyPoints.length === 0)) {
    return (
        <p className="text-muted-foreground text-sm p-4 text-center">
            Echo is listening... No previous session data found.
        </p>
    );
  }
  
  return (
    <div className="p-2 h-full flex flex-col">
        <ScrollArea className="flex-grow pr-1">
            <div className="space-y-3">
                <p className="text-sm italic text-foreground/90">{summary}</p>
                {keyPoints && keyPoints.length > 0 && (
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                        {keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                )}
            </div>
        </ScrollArea>
    </div>
  );
}
