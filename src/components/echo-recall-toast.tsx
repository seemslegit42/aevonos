import React from 'react';
import type { SessionRecallOutput } from '@/ai/agents/echo';

export function EchoRecallToast({ summary, keyPoints }: SessionRecallOutput) {
  return (
    <div>
      <p>{summary}</p>
      <ul className="list-disc pl-4 mt-2">
        {keyPoints.map((point, i) => <li key={i}>{point}</li>)}
      </ul>
    </div>
  );
}
