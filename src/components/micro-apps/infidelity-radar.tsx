
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Bot, Loader2, ChevronRight, EyeOff, Search, Globe, Linkedin, Twitter as XIcon, Instagram, VenetianMask } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { handleInfidelityAnalysis, handleDeployDecoy, handleOsintScan } from '@/app/actions';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import type { DecoyInput } from '@/ai/agents/decoy-schemas';
import type { OsintInput, OsintOutput, SocialProfileSchema as SocialProfileType } from '@/ai/agents/osint-schemas';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

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

const OsintReportPanel = ({ report }: { report: OsintOutput }) => {
    const socialIcons: Record<string, React.ElementType> = {
        LinkedIn, X: XIcon, Instagram, Facebook, Venmo: VenetianMask,
    };
    
    return (
        <div className="space-y-3">
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
            
            {report.socialProfiles.length > 0 && <Separator />}
            
            {report.socialProfiles.length > 0 && (
                <div>
                    <h4 className="font-bold text-primary">Social Media Footprint</h4>
                    <div className="space-y-2 mt-1">
                        {report.socialProfiles.map(profile => {
                            const Icon = socialIcons[profile.platform] || Globe;
                            return (
                                <div key={profile.url} className="text-xs p-2 border rounded-md bg-background/50">
                                    <div className="flex items-center gap-2 font-bold">
                                        <Icon className="h-4 w-4" />
                                        <a href={profile.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{profile.platform} - @{profile.username}</a>
                                        <Badge variant={profile.privacyLevel === 'Public' ? 'secondary' : 'destructive'} className="ml-auto text-xs">{profile.privacyLevel}</Badge>
                                    </div>
                                    <p className="text-foreground/80 italic mt-1">"{profile.recentActivity}"</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function InfidelityRadar() {
  const isMobile = useIsMobile();
  const [isScanning, setIsScanning] = useState(false);
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<InfidelityAnalysisOutput | null>(null);
  
  const [isOsintScanning, setIsOsintScanning] = useState(false);
  const [osintTarget, setOsintTarget] = useState('');
  const [osintReport, setOsintReport] = useState<OsintOutput | null>(null);

  const [isDecoyPanelOpen, setIsDecoyPanelOpen] = useState(false);

  const handleRunScan = async () => {
      if (!analysisInput) return;
      setIsScanning(true);
      setAnalysisResult(null);
      const result = await handleInfidelityAnalysis({ situationDescription: analysisInput });
      setAnalysisResult(result);
      setIsScanning(false);
  }
  
  const handleRunOsintScan = async () => {
      if (!osintTarget) return;
      setIsOsintScanning(true);
      setOsintReport(null);
      const result = await handleOsintScan({ targetName: osintTarget, context: 'Infidelity Radar Investigation' });
      setOsintReport(result);
      setIsOsintScanning(false);
  }

  const riskScore = analysisResult?.riskScore ?? -1;

  return (
    <div className="p-2 h-full flex flex-col">
        <ScrollArea className="flex-grow pr-1 space-y-3">
             {/* OSINT Scan Section */}
            <div className="space-y-2 p-2 border border-dashed rounded-lg">
                <h3 className="font-semibold text-primary">OSINT Scan</h3>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Target's Name..."
                        value={osintTarget}
                        onChange={(e) => setOsintTarget(e.target.value)}
                        disabled={isOsintScanning}
                        className="bg-background/80"
                    />
                    <Button onClick={handleRunOsintScan} disabled={isOsintScanning || !osintTarget}>
                        {isOsintScanning ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                </div>
                {osintReport && <div className="pt-2"><OsintReportPanel report={osintReport} /></div>}
            </div>
        
            <Separator className="my-3" />
        
             {/* Behavioral Analysis Section */}
            <div className="space-y-2 p-2 border border-dashed rounded-lg">
                <h3 className="font-semibold text-primary">Behavioral Analysis</h3>
                <Textarea 
                    placeholder="Field Report: Describe the situation for analysis. Be specific..."
                    value={analysisInput}
                    onChange={(e) => setAnalysisInput(e.target.value)}
                    disabled={isScanning}
                    rows={4}
                    className="bg-background/80"
                />
                <Button className="w-full" onClick={handleRunScan} disabled={isScanning || !analysisInput}>
                    {isScanning ? <Loader2 className="animate-spin" /> : 'Run Behavioral Scan'}
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
                <h3 className="font-semibold text-primary">Counter-Intelligence</h3>
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
                            <DecoyDeploymentPanel />
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
                          <DecoyDeploymentPanel />
                      </CollapsibleContent>
                  </Collapsible>
                )}
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
