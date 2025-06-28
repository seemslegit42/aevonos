
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Scale, Calendar, FileText, Bot, Play } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { AuditorOutput } from '@/ai/agents/auditor-generalissimo-schemas';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


const HealthScoreDisplay = ({ score }: { score: number }) => {
    let color = 'bg-destructive';
    if (score > 75) color = 'bg-military-green';
    else if (score > 40) color = 'bg-primary';
    return (
        <div className="text-center">
            <p className="text-xs text-ledger-cream/80">Financial Health Score</p>
            <p className="text-5xl font-bold font-headline text-ledger-cream">{score}</p>
            <Progress value={score} className="h-2 mt-1 bg-military-green/30" indicatorClassName={color} />
        </div>
    )
}

export default function AuditorGeneralissimo(props: AuditorOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const [transactions, setTransactions] = useState('');
    const [report, setReport] = useState<AuditorOutput | null>(props && 'financialHealthScore' in props ? props : null);
    const { toast } = useToast();
    const audioRef = React.useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (props && 'financialHealthScore' in props) {
            setReport(props);
        }
    }, [props]);
    
    const playAudio = () => {
        audioRef.current?.play().catch(e => console.error("Audio playback error:", e));
    }
    
    const handleAudit = async () => {
        if (!transactions) {
            toast({ variant: 'destructive', title: "The Auditor is waiting.", description: "Provide transaction records. Do not waste my time." });
            return;
        }
        const command = `audit these transactions: "${transactions}"`;
        handleCommandSubmit(command);
    };

    return (
        <div className="p-2 space-y-3 h-full flex flex-col bg-military-green/10 border border-military-green/50 rounded-lg text-ledger-cream">
            <Card className="bg-military-green/20 border-military-green/50 text-ledger-cream">
                <CardHeader className="p-2">
                    <CardTitle className="text-base font-headline text-ledger-cream/90">Submit Records for Audit</CardTitle>
                    <CardDescription className="text-xs text-ledger-cream/70">"Discrepancies will be noted. And judged."</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Paste transaction data here (CSV format recommended)..."
                        value={transactions}
                        onChange={(e) => setTransactions(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                        className="bg-military-green/10 border-military-green/50 placeholder:text-ledger-cream/50 text-ledger-cream focus-visible:ring-ledger-cream"
                    />
                     <Button className="w-full bg-ledger-cream text-military-green hover:bg-ledger-cream/90" onClick={handleAudit} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Begin Audit'}
                    </Button>
                </CardContent>
            </Card>

            {report && (
                <Card className="bg-military-green/20 border-military-green/50 flex-grow overflow-y-auto">
                    <CardHeader className="p-3 space-y-3">
                        <HealthScoreDisplay score={report.financialHealthScore} />
                        <div className="flex justify-around text-center">
                            <div>
                                <p className="text-xs text-ledger-cream/70">Burn Rate</p>
                                <p className="text-2xl font-bold font-headline text-ledger-cream">{report.burnRateDays} <span className="text-base font-sans">days</span></p>
                            </div>
                        </div>
                         <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
                            <Bot className="h-4 w-4"/>
                            <AlertTitle className="flex justify-between items-center text-destructive">
                                <span>The Auditor's Roast</span>
                                 <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={playAudio} disabled={!report.overallRoastAudioUri}><Play className="h-4 w-4"/></Button>
                            </AlertTitle>
                            <AlertDescription className="italic text-destructive-foreground/80">
                                "{report.overallRoast}"
                            </AlertDescription>
                        </Alert>
                    </CardHeader>
                    <Separator className="bg-military-green/50"/>
                    <CardContent className="p-3 text-sm">
                        <h4 className="font-bold text-ledger-cream/80 mb-2">Audited Transactions</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {report.auditedTransactions.map((tx, i) => (
                                <div key={i} className="text-xs p-2 rounded border border-military-green/40 bg-military-green/10">
                                    <div className="flex justify-between font-mono">
                                        <span>{tx.date}</span>
                                        <span className="font-bold">${tx.amount.toFixed(2)}</span>
                                    </div>
                                    <p className="font-medium text-ledger-cream/90">{tx.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {tx.aiTags.map(tag => <Badge key={tag} variant="outline" className="text-xs bg-military-green/20 text-ledger-cream border-military-green/40">{tag}</Badge>)}
                                    </div>
                                    {tx.warning && <p className="text-destructive italic mt-1 text-xs">Warning: {tx.warning}</p>}
                                </div>
                            ))}
                        </div>
                         <Separator className="my-3 bg-military-green/50"/>
                         <Alert variant="destructive" className="bg-destructive/10">
                            <FileText className="h-4 w-4"/>
                            <AlertTitle className="text-destructive">Simulated IRS Field Audit</AlertTitle>
                            <AlertDescription className="text-xs italic text-destructive-foreground/80">
                                {report.irsAuditSimulation}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
             {report?.overallRoastAudioUri && <audio ref={audioRef} src={report.overallRoastAudioUri} className="hidden" />}
        </div>
    );
}
