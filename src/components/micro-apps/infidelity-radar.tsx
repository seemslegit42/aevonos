'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Bot, FileDown, Swords, HeartCrack } from 'lucide-react';
import { Badge } from '../ui/badge';

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

const SuspiciousPatternsList = () => (
  <Card className="bg-background/50">
    <CardHeader>
      <CardTitle className="text-sm">Suspicious Patterns</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
        <li>Late night message frequency increased by 42%</li>
        <li>New contact "Gym Buddy 💪" saved at 2:17 AM</li>
        <li>Location data anomaly detected Tuesday night</li>
      </ul>
    </CardContent>
  </Card>
);

const RiskScoreGauge = () => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-destructive">Risk Score</span>
            <span className="text-lg font-bold text-destructive">72%</span>
        </div>
        <Progress value={72} className="h-2 [&>div]:bg-destructive" />
    </div>
);

const DecoyDeploymentPanel = () => (
    <Card className="bg-destructive/10 border-destructive/50">
        <CardHeader>
            <CardTitle className="text-sm text-destructive flex items-center gap-2"><Bot /> Deploy AI Decoy</CardTitle>
            <CardDescription className="text-xs">Premium: Test loyalty with a fine-tuned seduction agent.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" className="w-full">Deploy Decoy</Button>
        </CardContent>
    </Card>
);

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


const AgentAnalysisLog = () => (
    <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Agent Summary</AlertTitle>
        <AlertDescription>
            Based on metadata, there is a 72% likelihood of concealed behavior.
        </AlertDescription>
    </Alert>
);

export default function InfidelityRadar() {
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
            <RiskScoreGauge />
            <AgentAnalysisLog />
            <ActivityHeatmap />
            <SuspiciousPatternsList />
            <DecoyDeploymentPanel />
            <AshleyMadisonPanel />
        </div>

        <div className="flex-shrink-0 grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <Button variant="outline"><FileDown /> Export Report</Button>
            <Button variant="secondary"><Swords /> Confront w/ AI Draft</Button>
        </div>
        <div className="pt-2">
             <Button className="w-full">Run Full Scan</Button>
        </div>
    </div>
  );
}
