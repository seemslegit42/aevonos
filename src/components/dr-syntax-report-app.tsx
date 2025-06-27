'use client';

import React from 'react';
import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import { Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DrSyntaxReportAppProps {
  result: DrSyntaxOutput;
}

export function DrSyntaxReportApp({ result }: DrSyntaxReportAppProps) {
  
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/50'}`}
          />
        ))}
        <span className="ml-2 font-bold text-md text-foreground">{rating}/10</span>
      </div>
    );
  };

  return (
    <ScrollArea className="h-full max-h-48">
        <div className="pr-4 space-y-3">
          <h4 className="font-headline text-md text-foreground">The Verdict</h4>
          <div className="space-y-3 text-xs">
            <div>
              <h5 className="font-semibold text-muted-foreground mb-1">Rating:</h5>
              {renderRating(result.rating)}
            </div>
              <div>
              <h5 className="font-semibold text-muted-foreground mb-1">Critique:</h5>
              <p className="text-foreground/90 italic">"{result.critique}"</p>
            </div>
            <div>
              <h5 className="font-semibold text-muted-foreground mb-1">Suggestion:</h5>
              <p className="text-foreground/90 font-mono bg-secondary/50 p-2 rounded-md">{result.suggestion}</p>
            </div>
          </div>
        </div>
    </ScrollArea>
  );
}
