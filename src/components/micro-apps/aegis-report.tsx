'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AegisReportProps {
  isAnomalous: boolean;
  anomalyExplanation: string;
}

export default function AegisReport({ isAnomalous, anomalyExplanation }: AegisReportProps) {
  const Icon = isAnomalous ? ShieldAlert : ShieldCheck;
  const colorClass = isAnomalous ? 'text-destructive' : 'text-accent';

  return (
    <div className="flex flex-col items-center text-center p-2">
      <Icon className={cn('h-12 w-12 mb-2', colorClass)} />
      <p className={cn("text-sm font-medium", colorClass)}>
        {isAnomalous ? 'Anomaly Detected' : 'System Normal'}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{anomalyExplanation}</p>
    </div>
  );
}
