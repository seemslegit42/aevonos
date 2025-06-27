'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { handleVinDieselValidation } from '@/app/actions';
import type { VinDieselOutput } from '@/ai/agents/vin-diesel-schemas';
import { cn } from '@/lib/utils';

export default function VinDiesel(props: VinDieselOutput | {}) {
  const [vin, setVin] = useState(props && 'vin' in props ? props.vin : '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VinDieselOutput | null>(props && 'isValid' in props ? props : null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  const handleValidate = async () => {
    if (!vin) return;
    setIsLoading(true);
    setProgress(0);
    setResult(null);
    const response = await handleVinDieselValidation({ vin });
    setResult(response);
    setIsLoading(false);
  };
  
  const ResultIcon = result?.isValid ? CheckCircle : XCircle;

  return (
    <div className="p-2 space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter 17-character VIN..."
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          disabled={isLoading}
          maxLength={17}
          className="font-mono tracking-widest bg-background/80 border-primary/50 focus-visible:ring-primary"
        />
        <Button onClick={handleValidate} disabled={isLoading || vin.length !== 17} className="bg-primary hover:bg-primary/90">
          {isLoading ? <Loader2 className="animate-spin" /> : 'Hit the Gas'}
        </Button>
      </div>
      
      {isLoading && (
        <div className="space-y-2">
            <p className="text-xs text-center text-primary font-medium animate-pulse">Nitro Boost Engaged...</p>
            <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary" />
        </div>
      )}

      {result && (
        <Alert variant={result.isValid ? 'default' : 'destructive'} className={cn("bg-background/50", result.isValid && "border-accent")}>
          <ResultIcon className="h-4 w-4" />
          <AlertTitle className="font-bold">{result.isValid ? "Validation Passed" : "Validation Failed"}</AlertTitle>
          <AlertDescription>
            <p className="italic mb-2">"{result.statusMessage}"</p>
            {result.isValid && result.decodedInfo && (
              <div className="text-xs font-mono grid grid-cols-3 gap-x-2">
                <span>MAKE: {result.decodedInfo.make || 'N/A'}</span>
                <span>MODEL: {result.decodedInfo.model || 'N/A'}</span>
                <span>YEAR: {result.decodedInfo.year || 'N/A'}</span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
