
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import type { VinDieselOutput } from '@/ai/agents/vin-diesel-schemas';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/store/app-store';

const ComplianceStatus = ({ label, status }: { label: string; status: string }) => {
    const getStatusColor = () => {
        switch (status?.toLowerCase()) {
            case 'passed':
            case 'cleared':
            case 'current':
                return 'text-green-400';
            case 'pending':
            case 'required':
                return 'text-yellow-400';
            case 'failed':
            case 'flagged':
                return 'text-destructive';
            default:
                return 'text-muted-foreground';
        }
    };
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className={cn("font-bold", getStatusColor())}>{status}</span>
        </div>
    );
}

export default function VinDiesel(props: VinDieselOutput | {}) {
  const { handleCommandSubmit, isLoading } = useAppStore(state => ({
    handleCommandSubmit: state.handleCommandSubmit,
    isLoading: state.isLoading
  }));
  const [vin, setVin] = useState(props && 'vin' in props ? props.vin : '');
  const [result, setResult] = useState<VinDieselOutput | null>(props && 'isValid' in props ? props : null);
  const [progress, setProgress] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(true);

  useEffect(() => {
    if (props && 'isValid' in props) {
        setResult(props);
        if (props.complianceReport) {
            setIsReportOpen(true);
        }
    }
  }, [props]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleValidate = async () => {
    if (!vin) return;
    const command = `validate the vin "${vin}"`;
    handleCommandSubmit(command);
  };
  
  const ResultIcon = result?.isValid ? CheckCircle : XCircle;

  return (
    <div className="p-2 space-y-3 h-full flex flex-col">
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
        <div className="flex-grow space-y-3 overflow-y-auto pr-1">
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
            
            {/* ExpansionLayer */}
            {result.complianceReport && (
                 <Collapsible open={isReportOpen} onOpenChange={setIsReportOpen}>
                    <CollapsibleTrigger asChild>
                         <Button variant="outline" className="w-full justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                               <span>Compliance Report</span>
                            </div>
                           <ChevronRight className={`transition-transform duration-200 ${isReportOpen ? 'rotate-90' : ''}`} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 space-y-2 text-sm bg-background/50 rounded-b-md border border-t-0">
                        <ComplianceStatus label="Registration" status={result.complianceReport.registration} />
                        <ComplianceStatus label="Customs" status={result.complianceReport.customs} />
                        <ComplianceStatus label="Safety Inspection" status={result.complianceReport.inspection} />
                    </CollapsibleContent>
                </Collapsible>
            )}

            {/* MonetizationHook */}
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
                <Label htmlFor="fast-lane" className="text-sm">Fast Lane</Label>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Switch id="fast-lane" disabled/>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Priority processing & real-time monitoring. <br/> Requires Artisan plan or higher.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

        </div>
      )}
    </div>
  );
}
