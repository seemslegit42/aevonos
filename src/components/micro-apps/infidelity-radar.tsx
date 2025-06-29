
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Bot, Loader2, ChevronRight, EyeOff, Search, Flame } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import type { DecoyOutput } from '@/ai/agents/decoy-schemas';
import type { OsintOutput } from '@/ai/agents/osint-schemas';
import type { DossierOutput } from '@/ai/agents/dossier-schemas';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/app-store';
import DossierExportPanel from './infidelity-radar/dossier-export-panel';
import DecoyDeploymentPanel from './infidelity-radar/decoy-deployment-panel';
import OsintReportPanel from './infidelity-radar/osint-report-panel';


export default function InfidelityRadar(props: { osintReport?: OsintOutput, analysisResult?: InfidelityAnalysisOutput, decoyResult?: DecoyOutput, dossierReport?: DossierOutput, legalDossierReport?: DossierOutput } | {}) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { handleCommandSubmit, isLoading, apps } = useAppStore(state => ({
    handleCommandSubmit: state.handleCommandSubmit,
    isLoading: state.isLoading,
    apps: state.apps,
  }));
  
  const thisAppProps = apps.find(app => app.type === 'infidelity-radar')?.contentProps || {};

  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<InfidelityAnalysisOutput | null>(thisAppProps.analysisResult || null);
  
  const [osintTarget, setOsintTarget] = useState('');
  const [osintContext, setOsintContext] = useState('');
  const [osintReport, setOsintReport] = useState<OsintOutput | null>(thisAppProps.osintReport || null);
  const [decoyResult, setDecoyResult] = useState<DecoyOutput | null>(thisAppProps.decoyResult || null);
  const [dossierReport, setDossierReport] = useState<DossierOutput | null>(thisAppProps.dossierReport || null);
  const [legalDossierReport, setLegalDossierReport] = useState<DossierOutput | null>(thisAppProps.legalDossierReport || null);
  const [isArmed, setIsArmed] = useState(false);


  const [isDecoyPanelOpen, setIsDecoyPanelOpen] = useState(false);

  useEffect(() => {
    const currentProps = apps.find(app => app.type === 'infidelity-radar')?.contentProps || {};
    if (currentProps.osintReport) setOsintReport(currentProps.osintReport);
    if (currentProps.analysisResult) setAnalysisResult(currentProps.analysisResult);
    if (currentProps.decoyResult) setDecoyResult(currentProps.decoyResult);
    if (currentProps.dossierReport) setDossierReport(currentProps.dossierReport);
    if (currentProps.legalDossierReport) setLegalDossierReport(currentProps.legalDossierReport);
  }, [apps]);


  const handleRunScan = async () => {
      if (!analysisInput) return;
      const command = `analyze the following situation for infidelity risk: "${analysisInput}"`;
      handleCommandSubmit(command);
  }
  
  const handleRunOsintScan = async () => {
      if (!osintTarget) {
          toast({ variant: 'destructive', title: 'OSINT Error', description: 'Target name is required.' });
          return;
      }
      const command = `perform an osint scan on "${osintTarget}" with the following context: "${osintContext}"`;
      handleCommandSubmit(command);
  }

  const handleBurnBridge = () => {
    if (!osintTarget) {
        toast({ variant: 'destructive', title: "Target Required", description: "The Burn Bridge Protocol requires a target name for the OSINT scan." });
        return;
    }
     if (!analysisInput) {
        toast({ variant: 'destructive', title: "Situation Required", description: "The Burn Bridge Protocol requires a situation description for behavioral analysis." });
        return;
    }
    const command = `burn the bridge with target "${osintTarget}" using this context: "${osintContext}". The situation description for analysis is: "${analysisInput}"`;
    handleCommandSubmit(command);
    setIsArmed(false);
  }
  
  const handleCompileDossier = async (mode: 'standard' | 'legal' = 'standard') => {
      if (!osintReport && !analysisResult) {
          toast({ variant: 'destructive', title: "No Data", description: "Need to run at least one scan before creating a dossier." });
          return;
      }
      const target = osintTarget || "Unnamed Subject";
      
      const dossierInputPayload = {
          targetName: target,
          osintReport: osintReport || undefined,
          analysisResult: analysisResult || undefined,
          decoyResult: decoyResult || undefined,
          mode: mode,
          preparedFor: mode === 'legal' ? "Attorney Review // Case #AR-2024-889" : undefined
      };

      const command = `generate a ${mode} dossier for target "${target}" with the following data: ${JSON.stringify(dossierInputPayload)}`;
      handleCommandSubmit(command);
  };

  const riskScore = analysisResult?.riskScore ?? -1;

  return (
    <div className="p-2 h-full flex flex-col">
        <ScrollArea className="flex-grow pr-1 space-y-3">
             <Card className="bg-destructive/20 border-destructive/50">
                <CardHeader className="p-2">
                    <CardTitle className="text-base text-destructive flex items-center gap-2"><Flame /> Burn Bridge Protocol</CardTitle>
                    <CardDescription className="text-xs text-destructive/80">"When doubt becomes a liability, liquidate the asset."</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <p className="text-xs text-destructive/70">
                        This will trigger a full-spectrum analysis, including OSINT, behavioral scans, and decoy deployment, culminating in a final dossier. This action is irreversible.
                    </p>
                    {!isArmed ? (
                        <Button variant="destructive" className="w-full" onClick={() => setIsArmed(true)} disabled={isLoading || !osintTarget || !analysisInput}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Initiate Full Scan</>}
                        </Button>
                    ) : (
                        <Card className="bg-destructive/20 border-destructive p-3">
                            <p className="text-center text-sm font-bold text-destructive">CONFIRM: BURN BRIDGE</p>
                            <p className="text-center text-xs text-destructive/80 mb-3">This action is irreversible and will consume significant Agent Actions.</p>
                            <div className="flex gap-2">
                                <Button variant="secondary" className="w-full" onClick={() => setIsArmed(false)} disabled={isLoading}>Cancel</Button>
                                <Button variant="destructive" className="w-full" onClick={handleBurnBridge} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : <><Flame className="mr-2 h-4 w-4"/>Execute</>}
                                </Button>
                            </div>
                        </Card>
                    )}
                </CardContent>
            </Card>

            <Separator className="my-3" />
        
             {/* OSINT Scan Section */}
            <div className="space-y-2 p-2 border border-dashed rounded-lg">
                <h3 className="font-semibold text-primary">OSINT Scan (Bloodhound)</h3>
                 <Input 
                    placeholder="Target's Name (Required)"
                    value={osintTarget}
                    onChange={(e) => setOsintTarget(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/80"
                />
                <Textarea 
                    placeholder="Additional Context (Optional): email, phone, social URLs..."
                    value={osintContext}
                    onChange={(e) => setOsintContext(e.target.value)}
                    disabled={isLoading}
                    rows={2}
                    className="bg-background/80"
                />
                <Button onClick={handleRunOsintScan} disabled={isLoading || !osintTarget} className="w-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : <><Search className="mr-2"/>Run OSINT Scan</>}
                </Button>
                {osintReport && <div className="pt-2"><OsintReportPanel report={osintReport} /></div>}
            </div>
        
            <Separator className="my-3" />
        
             {/* Behavioral Analysis Section */}
            <div className="space-y-2 p-2 border border-dashed rounded-lg">
                <h3 className="font-semibold text-primary">Behavioral Analysis (Local)</h3>
                <Textarea 
                    placeholder="Field Report: Describe the situation for analysis. Be specific..."
                    value={analysisInput}
                    onChange={(e) => setAnalysisInput(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    className="bg-background/80"
                />
                <Button className="w-full" onClick={handleRunScan} disabled={isLoading || !analysisInput}>
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Run Behavioral Scan'}
                </Button>
                
                {analysisResult && (
                     <div className="space-y-3 pt-2">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-destructive">Behavioral Risk Score</span>
                                <span className="text-lg font-bold text-destructive">{riskScore >= 0 ? `${riskScore}%` : 'N/A'}</span>
                            </div>
                            <Progress value={riskScore >= 0 ? riskScore : 0} className="h-2 [&>div]:bg-destructive" />
                        </div>

                        <Alert variant="default" className="bg-background/50">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Agent Summary</AlertTitle>
                            <AlertDescription>{analysisResult.riskSummary}</AlertDescription>
                        </Alert>

                        {analysisResult.keyFactors.length > 0 && (
                            <div>
                                 <h4 className="text-sm font-medium mb-1">Key Factors</h4>
                                 <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                                    {analysisResult.keyFactors.map((factor, index) => <li key={index}>{factor}</li>)}
                                </ul>
                            </div>
                        )}
                     </div>
                )}
            </div>
            
            <Separator className="my-3" />

            {/* Counter-Intelligence Section */}
             <div className="space-y-2 p-2 border border-dashed rounded-lg">
                <h3 className="font-semibold text-primary">Counter-Intelligence (Local)</h3>
                {isMobile ? (
                  <Sheet>
                      <SheetTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                              Deploy AI Decoy <ChevronRight />
                          </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[90%] rounded-t-lg p-4 flex flex-col bg-background border-t border-border">
                          <SheetHeader className="mb-2 flex-shrink-0">
                              <SheetTitle>Deploy AI Decoy</SheetTitle>
                          </SheetHeader>
                          <div className="overflow-y-auto flex-grow">
                            <DecoyDeploymentPanel decoyResult={decoyResult} />
                          </div>
                      </SheetContent>
                  </Sheet>
                ) : (
                  <Collapsible open={isDecoyPanelOpen} onOpenChange={setIsDecoyPanelOpen} className="space-y-2">
                      <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                              Deploy AI Decoy <ChevronRight className={`transition-transform duration-200 ${isDecoyPanelOpen ? 'rotate-90' : ''}`} />
                          </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                          <DecoyDeploymentPanel decoyResult={decoyResult} />
                      </CollapsibleContent>
                  </Collapsible>
                )}
             </div>

            <Separator className="my-3" />
            
             <div className="space-y-2 p-2 border border-dashed rounded-lg">
                <h3 className="font-semibold text-primary">Dossier Export</h3>
                 <Button onClick={() => handleCompileDossier('standard')} disabled={isLoading || (!osintReport && !analysisResult)} className="w-full bg-primary text-primary-foreground">
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Compile Dossier</>}
                 </Button>
                 <Button onClick={() => handleCompileDossier('legal')} disabled={isLoading || (!osintReport && !analysisResult)} className="w-full bg-destructive text-destructive-foreground mt-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Compile Legal Dossier</>}
                 </Button>
                {dossierReport && <DossierExportPanel report={dossierReport} osintReport={osintReport} analysisResult={analysisResult} decoyResult={decoyResult} targetName={osintTarget || 'Unnamed Subject'} />}
                {legalDossierReport && <DossierExportPanel report={legalDossierReport} isLegal={true} osintReport={osintReport} analysisResult={analysisResult} decoyResult={decoyResult} targetName={osintTarget || 'Unnamed Subject'} />}
             </div>


        </ScrollArea>
        {/* MonetizationHook */}
        <div className="flex-shrink-0 mt-auto pt-2 border-t border-border/50">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                            <Switch id="deep-cover-mode" disabled/>
                            <Label htmlFor="deep-cover-mode" className="text-xs text-muted-foreground">Deep Cover Mode</Label>
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs">Enables persistent, multi-channel decoy agents with advanced evasion tactics. Requires Artisan plan or higher.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </div>
  );
}
