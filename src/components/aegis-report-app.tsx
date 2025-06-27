'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface AegisReportAppProps {
  result: {
    isAnomalous: boolean;
    anomalyExplanation: string;
  };
}

export function AegisReportApp({ result }: AegisReportAppProps) {
  const { isAnomalous, anomalyExplanation } = result;

  return (
    <Alert variant={isAnomalous ? 'destructive' : 'default'} className={!isAnomalous ? "border-patina-green/50 bg-patina-green/10" : ""}>
      {isAnomalous ? (
        <ShieldAlert className="h-4 w-4" />
      ) : (
        <ShieldCheck className="h-4 w-4 text-patina-green" />
      )}
      <AlertTitle className={!isAnomalous ? "text-patina-green" : ""}>
        {isAnomalous ? 'Anomaly Detected' : 'System Secure'}
      </AlertTitle>
      <AlertDescription className={!isAnomalous ? "text-foreground/80" : ""}>
        {anomalyExplanation}
      </AlertDescription>
    </Alert>
  );
}
