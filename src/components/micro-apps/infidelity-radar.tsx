'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Bot, FileDown, Swords, HeartCrack, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { handleDeployDecoy } from '@/app/actions';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import type { DecoyInput } from '@/ai/agents/decoy-schemas';
import { handleInfidelityAnalysis } from '@/app/actions';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';

const ActivityHeatmap = () => (
  <Card className="bg-background/50">
    <CardHeader>
      <CardTitle className="text-sm">Activity Heatmap</CardTitle>
      <CardDescription className="text-xs">Unusual activity patterns.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="w-full h-24 bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Heatmap data placeholder</p>
      </div>
    </CardContent>
  </Card>
);

const SuspiciousPatternsList = ({ factors, isScanning }: { factors: string[], isScanning: boolean }) => (
  <Card className="bg-background/50">
    <CardHeader>
      <CardTitle className="text-sm">Suspicious Patterns</CardTitle>
    </CardHeader>
    <CardContent>
        {isScanning && <p className="text-xs text-muted-foreground">Scanning for signals...</p>}
        {!isScanning && factors.length === 0 && <p className="text-xs text-muted-foreground">No specific patterns flagged yet. Provide details and run a scan.</p>}
        {!isScanning && factors.length > 0 && (
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                {factors.map((factor, index) => <li key={index}>{factor}</li>)}
            </ul>
        )}
    </CardContent>
  </Card>
);

const RiskScoreGauge = ({ score }: { score: number }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-destructive">Risk Score</span>
            <span className="text-lg font-bold text-destructive">{score >= 0 ? `${score}%` : 'N/A'}</span>
        </div>
        <Progress value={score >= 0 ? score : 0} className="h-2 [&>div]:bg-destructive" />
    </div>
);

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
    <Card className="bg-destructive/10 border-destructive/50">
        <CardHeader>
            <CardTitle className="text-sm text-destructive flex items-center gap-2"><Bot /> Deploy AI Decoy</CardTitle>
            <CardDescription className="text-xs">Premium: Test loyalty with a fine-tuned seduction agent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <Textarea 
                placeholder="Describe the target (e.g., 'Named Alex, loves hiking and indie bands, profile says looking for something serious...')" 
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                disabled={isLoading}
                className="bg-background/50 border-destructive/30 focus-visible:ring-destructive"
            />
            <Select value={persona} onValueChange={(v: DecoyInput['persona']) => setPersona(v)} disabled={isLoading}>
                <SelectTrigger className="bg-background/50 border-destructive/30 focus:ring-destructive">
                    <SelectValue placeholder="Select decoy persona..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="sapiosexual">🧠 Sapiosexual</SelectItem>
                    <SelectItem value="alpha-hustler">💼 Alpha Hustler</SelectItem>
                    <SelectItem value="chill-demon">😏 Chill Demon</SelectItem>
                    <SelectItem value="awkward-sweetheart">🤓 Awkward Sweetheart</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="destructive" className="w-full" onClick={handleDeploy} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Deploy Decoy'}
            </Button>
            {result && (
                <Alert variant={result.startsWith("Error:") ? "destructive" : "default"} className="mt-3 bg-background/50">
                    <Bot className="h-4 w-4" />
                    <AlertTitle>{result.startsWith("Error:") ? "Deployment Failed" : "Decoy Message Generated"}</AlertTitle>
                    <AlertDescription className={result.startsWith("Error:") ? "" : "italic"}>
                        {result.startsWith("Error:") ? result : `"${result}"`}
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
    </Card>
  );
};


const AshleyMadisonPanel = () => (
    <Card className="bg-destructive/10 border-destructive/50">
        <CardHeader>
            <CardTitle className="text-sm text-destructive flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HeartCrack className="h-4 w-4" />
                    <span>External Signal: AM Scan</span>
                </div>
                <Badge variant="destructive">Black Label</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Intelligence operations for when you need to be sure.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" className="w-full">Run AM Scan</Button>
        </CardContent>
    </Card>
);


const AgentAnalysisLog = ({ summary, isScanning }: { summary: string, isScanning: boolean }) => (
    <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Agent Summary</AlertTitle>
        <AlertDescription>
            {isScanning ? 'Analyzing patterns...' : summary}
        </AlertDescription>
    </Alert>
);

export default function InfidelityRadar() {
  const [isScanning, setIsScanning] = useState(false);
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<InfidelityAnalysisOutput | null>(null);

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
    <div className="p-2 space-y-4 h-full flex flex-col">
        <Tabs defaultValue="stealth" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stealth">Stealth Mode</TabsTrigger>
                <TabsTrigger value="legal">Legal Mode</TabsTrigger>
                <TabsTrigger value="rage" className="text-destructive data-[state=active]:bg-destructive/80 data-[state=active]:text-destructive-foreground">Rage Mode</TabsTrigger>
            </TabsList>
        </Tabs>
        
        <div className="space-y-3 flex-grow overflow-y-auto pr-2">
            <RiskScoreGauge score={riskScore} />
            <AgentAnalysisLog summary={riskSummary} isScanning={isScanning} />

            <Card className="bg-background/50">
                <CardHeader>
                    <CardTitle className="text-sm">Field Report Input</CardTitle>
                    <CardDescription className="text-xs">Describe the situation for analysis. Be specific.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Textarea 
                        placeholder="e.g., 'Partner started hiding their phone screen. Comes home late smelling like someone else's perfume. Found a receipt for a hotel I've never been to...'"
                        value={analysisInput}
                        onChange={(e) => setAnalysisInput(e.target.value)}
                        disabled={isScanning}
                        rows={4}
                    />
                     <Button className="w-full" onClick={handleRunScan} disabled={isScanning || !analysisInput}>
                        {isScanning ? <Loader2 className="animate-spin" /> : 'Run Full Scan'}
                    </Button>
                </CardContent>
            </Card>

            <SuspiciousPatternsList factors={keyFactors} isScanning={isScanning} />
            <ActivityHeatmap />
            <DecoyDeploymentPanel />
            <AshleyMadisonPanel />
        </div>

        <div className="flex-shrink-0 grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <Button variant="outline" disabled={isScanning || !analysisResult}><FileDown /> Export Report</Button>
            <Button variant="secondary" disabled={isScanning || !analysisResult}><Swords /> Confront w/ AI Draft</Button>
        </div>
    </div>
  );
}
