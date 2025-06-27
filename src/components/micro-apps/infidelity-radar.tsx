
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Bot, Loader2, ChevronRight, EyeOff, Search, Globe, Linkedin, Twitter as XIcon, Instagram, VenetianMask, FileQuestion, BadgeAlert, PhoneOff, Skull, FileDown, FileJson, Lock, Unlock } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import type { DecoyInput, DecoyOutput } from '@/ai/agents/decoy-schemas';
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
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';

const DossierExportPanel = ({ report, osintReport, analysisResult, decoyResult, targetName }: { report: DossierOutput, osintReport: OsintOutput | null, analysisResult: InfidelityAnalysisOutput | null, decoyResult: DecoyOutput | null, targetName: string }) => {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [password, setPassword] = useState('');

    const handleExport = async (format: 'pdf' | 'json') => {
        setIsExporting(true);
        try {
            if (isEncrypted && !password) {
                toast({ variant: 'destructive', title: 'Encryption Error', description: 'A password is required to encrypt the dossier.' });
                setIsExporting(false);
                return;
            }
            
            const response = await fetch('/api/export/dossier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    format,
                    encrypt: isEncrypted,
                    password: password,
                    dossierInput: {
                        targetName,
                        osintReport,
                        analysisResult,
                        decoyResult,
                        redacted: false, // For now, hardcode this
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to export ${format}.`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const contentDisposition = response.headers.get('content-disposition');
            let fileName = `dossier.${format}`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch.length === 2) {
                    fileName = fileNameMatch[1];
                }
            }
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            toast({ title: "Export Successful", description: `${fileName} has been downloaded.`});

        } catch (error) {
            toast({ variant: 'destructive', title: 'Export Failed', description: (error as Error).message });
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <Card className="bg-primary/10 border-primary/50">
            <CardHeader className="p-2">
                <CardTitle className="text-base text-primary">Dossier Ready for Export</CardTitle>
                <CardDescription className="text-xs">"When suspicion becomes evidence, it gets a cover page."</CardDescription>
            </CardHeader>
            <CardContent className="p-2 space-y-3">
                <div className="bg-background/80 p-2 rounded-md max-h-40 overflow-y-auto border border-dashed backdrop-blur-sm filter blur-sm select-none pointer-events-none">
                    <pre className="text-xs whitespace-pre-wrap font-sans opacity-50">
                        {report.markdownContent.substring(0, 500)}...
                    </pre>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Switch id="encrypt-switch" checked={isEncrypted} onCheckedChange={setIsEncrypted} />
                        <Label htmlFor="encrypt-switch" className="flex items-center gap-1">
                            {isEncrypted ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                             Encrypt
                        </Label>
                    </div>
                     {isEncrypted && (
                        <Input 
                            type="password"
                            placeholder="Encryption Password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-8 w-40 bg-background/80"
                        />
                    )}
                </div>
                 <div className="flex gap-2">
                    <Button variant="secondary" className="w-full" disabled={isExporting} onClick={() => handleExport('pdf')}>
                        {isExporting ? <Loader2 className="animate-spin" /> : <><FileDown className="mr-2" /> Unlock PDF ($19.99)</>}
                    </Button>
                     <Button variant="outline" className="w-full" disabled={isExporting} onClick={() => handleExport('json')}>
                        {isExporting ? <Loader2 className="animate-spin" /> : <><FileJson className="mr-2" /> + JSON ($29.99)</>}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
};


const DecoyDeploymentPanel = ({ decoyResult }: { decoyResult: DecoyOutput | null }) => {
    const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading
    }));
    const { toast } = useToast();
    const [result, setResult] = useState<DecoyOutput | null>(decoyResult);
    const [targetDescription, setTargetDescription] = useState('');
    const [persona, setPersona] = useState<DecoyInput['persona']>('chill-demon');

    useEffect(() => {
        setResult(decoyResult);
    }, [decoyResult]);

    const handleDeploy = async () => {
      if (!targetDescription) {
          toast({ variant: 'destructive', title: "Intel Required", description: "The decoy needs a target description to proceed." });
          return;
      }
      const command = `deploy a decoy with persona "${persona}" to a target described as: "${targetDescription}"`;
      handleCommandSubmit(command);
    }
  
    return (
      <div className="space-y-3">
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
        {result?.decoyMessage && (
            <Alert variant={result.decoyMessage.startsWith("Error:") ? "destructive" : "default"} className="mt-3 bg-background/80">
                <Bot className="h-4 w-4" />
                <AlertTitle>{result.decoyMessage.startsWith("Error:") ? "Deployment Failed" : "Decoy Message Generated"}</AlertTitle>
                <AlertDescription className={result.decoyMessage.startsWith("Error:") ? "" : "italic"}>
                    {result.decoyMessage.startsWith("Error:") ? result.decoyMessage : `"${result.decoyMessage}"`}
                </AlertDescription>
            </Alert>
        )}
      </div>
    );
};

const OsintReportPanel = ({ report }: { report: OsintOutput }) => {
    const socialIcons: Record<string, React.ElementType> = {
        LinkedIn, 'X': XIcon, Instagram, GitHub: FileQuestion, TikTok: VenetianMask, 'Unknown': Globe
    };
    
    return (
        <ScrollArea className="h-96 pr-2">
            <div className="space-y-4">
                <div>
                    <h4 className="font-bold text-primary">Intelligence Summary</h4>
                    <p className="text-xs text-foreground/90">{report.summary}</p>
                </div>
                
                <Separator />

                <div>
                    <h4 className="font-bold text-destructive">Risk Factors</h4>
                    <ul className="text-xs list-disc pl-4 text-destructive/90 space-y-1">
                        {report.riskFactors.map((factor, i) => <li key={i}>{factor}</li>)}
                    </ul>
                </div>
                
                {report.breaches && report.breaches.length > 0 && <Separator />}
                {report.breaches && report.breaches.length > 0 && (
                     <div>
                        <h4 className="font-bold text-yellow-400 flex items-center gap-2"><BadgeAlert /> Data Breaches</h4>
                        <div className="space-y-2 mt-1">
                            {report.breaches.map(breach => (
                                <div key={breach.name} className="text-xs p-2 border border-yellow-400/50 rounded-md bg-background/50">
                                    <p className="font-bold text-yellow-400">{breach.name} ({breach.breachDate})</p>
                                    <p className="text-foreground/80 italic mt-1">{breach.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {report.intelXLeaks && report.intelXLeaks.length > 0 && <Separator />}
                {report.intelXLeaks && report.intelXLeaks.length > 0 && (
                    <div>
                        <h4 className="font-bold text-red-500 flex items-center gap-2"><Skull /> IntelX Leaks</h4>
                        <div className="space-y-2 mt-1">
                            {report.intelXLeaks.map(leak => (
                                <div key={leak.source} className="text-xs p-2 border border-red-500/50 rounded-md bg-background/50">
                                    <p className="font-bold text-red-500">{leak.source} ({leak.date})</p>
                                    <p className="text-foreground/80 italic mt-1">{leak.details}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {report.burnerPhoneCheck && <Separator />}
                {report.burnerPhoneCheck && (
                    <div>
                        <h4 className="font-bold text-orange-400 flex items-center gap-2"><PhoneOff /> Burner Phone Check</h4>
                        <div className="text-xs p-2 border border-orange-400/50 rounded-md bg-background/50">
                            {report.burnerPhoneCheck.isBurner ? (
                                <p>Number is flagged as a <span className="font-bold">burner/VoIP</span> service ({report.burnerPhoneCheck.carrier}).</p>
                            ) : (
                                <p>Number appears to be a standard mobile number from {report.burnerPhoneCheck.carrier}.</p>
                            )}
                        </div>
                    </div>
                )}

                {report.socialProfiles && report.socialProfiles.length > 0 && <Separator />}
                {report.socialProfiles && report.socialProfiles.length > 0 && (
                    <div>
                        <h4 className="font-bold text-primary">Social Media Footprint</h4>
                        <div className="space-y-2 mt-1">
                            {report.socialProfiles.map(profile => {
                                const Icon = socialIcons[profile.platform] || Globe;
                                return (
                                    <div key={profile.username} className="text-xs p-2 border rounded-md bg-background/50">
                                        <div className="flex items-center gap-2 font-bold">
                                            <Icon className="h-4 w-4" />
                                            <span>{profile.platform} - @{profile.username}</span>
                                             <Badge variant="secondary" className="ml-auto text-xs">{profile.followerCount.toLocaleString()} followers</Badge>
                                        </div>
                                        <p className="font-medium text-foreground/80 mt-1">{profile.bio}</p>
                                        <div className="text-foreground/80 italic mt-1">
                                            <p className="font-semibold not-italic text-muted-foreground">Recent Activity:</p>
                                            <ul className="list-disc pl-4">
                                                {profile.recentPosts.map((post, i) => <li key={i}>{post}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}

export default function InfidelityRadar(props: { osintReport?: OsintOutput, analysisResult?: InfidelityAnalysisOutput, decoyResult?: DecoyOutput, dossierReport?: DossierOutput } | {}) {
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

  const [isDecoyPanelOpen, setIsDecoyPanelOpen] = useState(false);

  useEffect(() => {
    const currentProps = apps.find(app => app.type === 'infidelity-radar')?.contentProps || {};
    if (currentProps.osintReport) setOsintReport(currentProps.osintReport);
    if (currentProps.analysisResult) setAnalysisResult(currentProps.analysisResult);
    if (currentProps.decoyResult) setDecoyResult(currentProps.decoyResult);
    if (currentProps.dossierReport) setDossierReport(currentProps.dossierReport);
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
  
  const handleCompileDossier = async () => {
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
      };

      const command = `generate a dossier for target "${target}" with the following data: ${JSON.stringify(dossierInputPayload)}`;
      handleCommandSubmit(command);
  };

  const riskScore = analysisResult?.riskScore ?? -1;

  return (
    <div className="p-2 h-full flex flex-col">
        <ScrollArea className="flex-grow pr-1 space-y-3">
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
                 <Button onClick={handleCompileDossier} disabled={isLoading || (!osintReport && !analysisResult)} className="w-full bg-primary text-primary-foreground">
                    {isLoading ? <Loader2 className="animate-spin" /> : <><FileDown className="mr-2"/>Compile Dossier</>}
                </Button>
                {dossierReport && <DossierExportPanel report={dossierReport} osintReport={osintReport} analysisResult={analysisResult} decoyResult={decoyResult} targetName={osintTarget || 'Unnamed Subject'} />}
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
