
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Bot, Loader2, ChevronRight, EyeOff, Search, Globe, Linkedin, Twitter as XIcon, Instagram, VenetianMask, FileQuestion, BadgeAlert, PhoneOff, Skull } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { handleInfidelityAnalysis, handleDeployDecoy, handleOsintScan } from '@/app/actions';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import type { DecoyInput } from '@/ai/agents/decoy-schemas';
import type { OsintOutput } from '@/ai/agents/osint-schemas';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { FirecrawlerReport } from '@/ai/tools/firecrawler-schemas';

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

                {report.firecrawlerReports && report.firecrawlerReports.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="font-bold text-blue-400 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l.79-.79"></path></svg>
                                Raw Scraped Data (Firecrawler)
                            </h4>
                            <div className="space-y-2 mt-1">
                                {report.firecrawlerReports.map((fireReport, index) => (
                                    <div key={index} className="text-xs p-2 border border-blue-400/50 rounded-md bg-background/50">
                                        {(fireReport as any).success ? (
                                            <>
                                                <p className="font-bold text-blue-400">Scan of: {(fireReport as any).data.metadata?.sourceURL || 'a tracked URL'}</p>
                                                <pre className="whitespace-pre-wrap font-mono text-xs break-words">{(fireReport as any).data.markdown}</pre>
                                            </>
                                        ) : (
                                            <p className="text-destructive">Failed to scrape a URL: {(fireReport as any).error}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                
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

export default function InfidelityRadar() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<InfidelityAnalysisOutput | null>(null);
  
  const [isOsintScanning, setIsOsintScanning] = useState(false);
  const [osintTarget, setOsintTarget] = useState('');
  const [osintContext, setOsintContext] = useState('');
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
      if (!osintTarget) {
          toast({ variant: 'destructive', title: 'OSINT Error', description: 'Target name is required.' });
          return;
      }
      setIsOsintScanning(true);
      setOsintReport(null);
      const result = await handleOsintScan({ targetName: osintTarget, context: osintContext });
      setOsintReport(result);
      setIsOsintScanning(false);
  }

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
                    disabled={isOsintScanning}
                    className="bg-background/80"
                />
                <Textarea 
                    placeholder="Additional Context (Optional): email, phone, social URLs..."
                    value={osintContext}
                    onChange={(e) => setOsintContext(e.target.value)}
                    disabled={isOsintScanning}
                    rows={2}
                    className="bg-background/80"
                />
                <Button onClick={handleRunOsintScan} disabled={isOsintScanning || !osintTarget} className="w-full">
                    {isOsintScanning ? <Loader2 className="animate-spin" /> : <><Search className="mr-2"/>Run OSINT Scan</>}
                </Button>
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
