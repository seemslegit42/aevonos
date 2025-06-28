
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
    if (score > 75) color = 'bg-accent';
    else if (score > 40) color = 'bg-primary';
    return (
        <div className="text-center">
            <p className="text-xs text-muted-foreground">Financial Health Score</p>
            <p className="text-5xl font-bold font-headline text-foreground">{score}</p>
            <Progress value={score} className="h-2 mt-1" indicatorClassName={color} />
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
        <div className="p-2 space-y-3 h-full flex flex-col bg-secondary/20 border border-border/50 rounded-lg">
            <Card className="bg-secondary border-border">
                <CardHeader className="p-2">
                    <CardTitle className="text-base font-headline text-primary">Submit Records for Audit</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">"Discrepancies will be noted. And judged."</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Paste transaction data here (CSV format recommended)..."
                        value={transactions}
                        onChange={(e) => setTransactions(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                        className="bg-background border-border placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                     <Button className="w-full" onClick={handleAudit} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Begin Audit'}
                    </Button>
                </CardContent>
            </Card>

            {report && (
                <Card className="bg-secondary border-border flex-grow overflow-y-auto">
                    <CardHeader className="p-3 space-y-3">
                        <HealthScoreDisplay score={report.financialHealthScore} />
                        <div className="flex justify-around text-center">
                            <div>
                                <p className="text-xs text-muted-foreground">Burn Rate</p>
                                <p className="text-2xl font-bold font-headline text-foreground">{report.burnRateDays} <span className="text-base font-sans">days</span></p>
                            </div>
                        </div>
                         <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
                            <Bot className="h-4 w-4"/>
                            <AlertTitle className="flex justify-between items-center">
                                <span>The Auditor's Roast</span>
                                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={playAudio} disabled={!report.overallRoastAudioUri}><Play className="h-4 w-4"/></Button>
                            </AlertTitle>
                            <AlertDescription className="italic">
                                "{report.overallRoast}"
                            </AlertDescription>
                        </Alert>
                    </CardHeader>
                    <Separator className="bg-border"/>
                    <CardContent className="p-3 text-sm">
                        <h4 className="font-bold text-primary mb-2">Audited Transactions</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {report.auditedTransactions.map((tx, i) => (
                                <div key={i} className="text-xs p-2 rounded border border-border bg-background/50">
                                    <div className="flex justify-between font-mono">
                                        <span>{tx.date}</span>
                                        <span className="font-bold">${tx.amount.toFixed(2)}</span>
                                    </div>
                                    <p className="font-medium">{tx.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {tx.aiTags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                                    </div>
                                    {tx.warning && <p className="text-destructive/80 italic mt-1 text-xs">Warning: {tx.warning}</p>}
                                </div>
                            ))}
                        </div>
                         <Separator className="my-3 bg-border"/>
                         <Alert variant="destructive" className="bg-destructive/10">
                            <FileText className="h-4 w-4"/>
                            <AlertTitle>Simulated IRS Field Audit</AlertTitle>
                            <AlertDescription className="text-xs italic">
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
