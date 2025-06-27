
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Bot, Loader2, ChevronRight } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { handleInfidelityAnalysis } from '@/app/actions';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import type { DecoyInput } from '@/ai/agents/decoy-schemas';
import { handleDeployDecoy } from '@/app/actions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const DecoyDeploymentPanel = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [targetDescription, setTargetDescription] = useState('');
    const [persona, setPersona] = useState<DecoyInput['persona']>('chill-demon');

    const handleDeploy = async () => {
      if (!targetDescription) {
          setResult("Error: Target description cannot be empty.");
          return;
      }
      setIsLoading(true);
      setResult(null);
      const response = await handleDeployDecoy({ targetDescription, persona });
      setResult(response.decoyMessage);
      setIsLoading(false);
    }
  
    return (
      <div className="space-y-3 pt-4">
        <h4 className="text-sm font-medium text-center text-muted-foreground">Deploy AI Decoy</h4>
        <Textarea 
            placeholder="Describe the target (e.g., 'Named Alex, loves hiking and indie bands...')" 
            value={targetDescription}
            onChange={(e) => setTargetDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="bg-background/80"
        />
        <Select value={persona} onValueChange={(v: DecoyInput['persona']) => setPersona(v)} disabled={isLoading}>
            <SelectTrigger>
                <SelectValue placeholder="Select decoy persona..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="sapiosexual">🧠 Sapiosexual</SelectItem>
                <SelectItem value="alpha-hustler">💼 Alpha Hustler</SelectItem>
                <SelectItem value="chill-demon">😏 Chill Demon</SelectItem>
                <SelectItem value="awkward-sweetheart">🤓 Awkward Sweetheart</SelectItem>
            </SelectContent>
        </Select>
        <Button variant="secondary" className="w-full" onClick={handleDeploy} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <><Bot className="mr-2 h-4 w-4" /> Deploy Decoy</>}
        </Button>
        {result && (
            <Alert variant={result.startsWith("Error:") ? "destructive" : "default"} className="mt-3 bg-background/80">
                <Bot className="h-4 w-4" />
                <AlertTitle>{result.startsWith("Error:") ? "Deployment Failed" : "Decoy Message Generated"}</AlertTitle>
                <AlertDescription className={result.startsWith("Error:") ? "" : "italic"}>
                    {result.startsWith("Error:") ? result : `"${result}"`}
                </AlertDescription>
            </Alert>
        )}
      </div>
    );
  };


export default function InfidelityRadar() {
  const [isScanning, setIsScanning] = useState(false);
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<InfidelityAnalysisOutput | null>(null);
  const [isDecoyPanelOpen, setIsDecoyPanelOpen] = useState(false);

  const handleRunScan = async () => {
      if (!analysisInput) return;
      setIsScanning(true);
      setAnalysisResult(null);
      const result = await handleInfidelityAnalysis({ situationDescription: analysisInput });
      setAnalysisResult(result);
      setIsScanning(false);
  }

  const riskScore = analysisResult?.riskScore ?? -1;
  const riskSummary = analysisResult?.riskSummary ?? "Awaiting analysis. Provide details in the input field below and run a scan.";
  const keyFactors = analysisResult?.keyFactors ?? [];

  return (
    <div className="p-2 space-y-3 h-full flex flex-col">
        <div className="flex-grow space-y-3 overflow-y-auto pr-1">
            <Textarea 
                placeholder="Field Report: Describe the situation for analysis. Be specific. e.g., 'Partner started hiding their phone screen. Comes home late...'"
                value={analysisInput}
                onChange={(e) => setAnalysisInput(e.target.value)}
                disabled={isScanning}
                rows={4}
                className="bg-background/80"
            />
            <Button className="w-full" onClick={handleRunScan} disabled={isScanning || !analysisInput}>
                {isScanning ? <Loader2 className="animate-spin" /> : 'Run Full Scan'}
            </Button>
            
            {analysisResult && (
                 <div className="space-y-3 pt-2">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-destructive">Risk Score</span>
                            <span className="text-lg font-bold text-destructive">{riskScore >= 0 ? `${riskScore}%` : 'N/A'}</span>
                        </div>
                        <Progress value={riskScore >= 0 ? riskScore : 0} className="h-2 [&>div]:bg-destructive" />
                    </div>

                    <Alert variant="default" className="bg-background/50">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Agent Summary</AlertTitle>
                        <AlertDescription>{riskSummary}</AlertDescription>
                    </Alert>

                    {keyFactors.length > 0 && (
                        <div>
                             <h4 className="text-sm font-medium mb-1">Key Factors</h4>
                             <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                                {keyFactors.map((factor, index) => <li key={index}>{factor}</li>)}
                            </ul>
                        </div>
                    )}

                    <Collapsible open={isDecoyPanelOpen} onOpenChange={setIsDecoyPanelOpen} className="space-y-2">
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                Deploy Counter-Intelligence
                                <ChevronRight className={`transition-transform duration-200 ${isDecoyPanelOpen ? 'rotate-90' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <DecoyDeploymentPanel />
                        </CollapsibleContent>
                    </Collapsible>
                 </div>
            )}
        </div>
    </div>
  );
}
