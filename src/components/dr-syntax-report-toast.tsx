
import React from 'react';
import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';

export function DrSyntaxReportToast({ critique, suggestion }: DrSyntaxOutput) {
  return (
    <div>
        <p className="font-bold">Critique:</p>
        <p className="italic">{critique}</p>
        <p className="mt-2 font-bold">Suggestion:</p>
        <p className="italic">{suggestion}</p>
    </div>
  );
}
