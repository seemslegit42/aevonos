
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, FileWarning, Bomb, Brain, FileUp } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { AuditorOutput, AuditedTransaction } from '@/ai/agents/auditor-generalissimo-schemas';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';

const BurnRateThermometer = ({ days }: { days: number }) => {
    const getStatus = (d: number) => {
        if (d > 90) return { text: "Solvent", color: "text-accent" };
        if (d > 30) return { text: "Concerning", color: "text-yellow-400" };
        return { text: "Collapse Imminent", color: "text-destructive" };
    }
    const { text, color } = getStatus(days);

    return (
        <div className="text-center">
            <p className="font-mono text-4xl font-bold">{days}</p>
            <p className="text-xs font-semibold uppercase tracking-widest">Days Until Collapse</p>
            <p className={cn("text-sm font-bold mt-1", color)}>{text}</p>
        </div>
    )
}

const HealthScore = ({ score }: { score: number }) => {
    const getStatus = (s: number) => {
        if (s > 75) return { text: "Adequate", emoji: <Brain className="w-5 h-5"/>, color: "text-accent" };
        if (s > 40) return { text: "Questionable", emoji: <FileWarning className="w-5 h-5"/>, color: "text-yellow-400" };
        return { text: "Atrocious", emoji: <Bomb className="w-5 h-5"/>, color: "text-destructive" };
    }
    const { text, emoji, color } = getStatus(score);

    return (
        <div className="text-center">
            <div className={cn("text-4xl mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-background/50 border-2", color)}>
                {emoji}
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1">Financial Health</p>
            <p className={cn("text-sm font-bold", color)}>{text}</p>
        </div>
    )
}

const AuditedTransactionItem = ({ item }: { item: AuditedTransaction }) => {
    const hasWarning = !!item.warning;

    return (
        <div className={cn(
            "p-3 transition-all",
            hasWarning ? "bg-destructive/10" : ""
        )}>
            <div className="flex justify-between items-start">
                <div className="flex-grow pr-4">
                    <p className="font-semibold">{item.description}</p>
                    <p className="text-xs text-military-green-foreground/70">{item.date}</p>
                </div>
                <p className={cn(
                    "font-mono font-bold text-lg",
                    hasWarning ? "text-destructive" : ""
                )}>${item.amount.toFixed(2)}</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                {item.aiTags.map(tag => (
                    <Badge 
                        key={tag} 
                        variant={hasWarning ? "destructive" : "secondary"} 
                        className={cn(
                            "font-normal capitalize", 
                            !hasWarning && "bg-ledger-cream/20 text-ledger-cream"
                        )}
                    >
                        {tag.replace(/_/g, ' ')}
                    </Badge>
                ))}
            </div>
            {item.warning && (
                <Alert variant="destructive" className="mt-2 text-xs py-2 px-3 bg-destructive/20 border-destructive/30">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Auditor's Note</AlertTitle>
                    <AlertDescription className="text-destructive-foreground/90">
                       {item.warning}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};


export default function AuditorGeneralissimo(props: AuditorOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const [transactions, setTransactions] = useState('');
    const [report, setReport] = useState<AuditorOutput | null>(props && 'overallRoast' in props ? props : null);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props && 'overallRoast' in props) {
            setReport(props);
        }
    }, [props]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setTransactions(text);
                toast({
                    title: "File Loaded",
                    description: `Contents of ${file.name} loaded for audit.`
                });
            };
            reader.onerror = () => {
                toast({
                    variant: 'destructive',
                    title: "File Error",
                    description: "Could not read the selected file."
                });
            };
            reader.readAsText(file);
        }
    };

    const handleRunAudit = () => {
        if (!transactions) {
            toast({ variant: 'destructive', title: "No data, comrade.", description: "Provide transaction logs for immediate scrutiny." });
            return;
        }
        handleCommandSubmit(`audit my finances with these transactions: "${transactions}"`);
    }

    return (
        <div className="p-2 space-y-3 h-full flex flex-col font-typewriter bg-[hsl(var(--military-green))] text-[hsl(var(--military-green-foreground))] border border-military-green-foreground/20 rounded-lg">
             <Textarea 
                placeholder="Paste transaction data here (e.g., date,description,amount) or upload a CSV/TXT log file..."
                value={transactions}
                onChange={(e) => setTransactions(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="bg-black/20 border-military-green-foreground/30 text-ledger-cream placeholder:text-ledger-cream/50 focus-visible:ring-ledger-cream"
            />
            <Input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv,.txt"
            />
             <div className="flex gap-2">
                 <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isLoading} 
                    className="w-full bg-ledger-cream/10 text-ledger-cream border-ledger-cream/30 hover:bg-ledger-cream/20"
                >
                    <FileUp className="mr-2" />
                    Upload Log
                </Button>
                 <Button 
                    onClick={handleRunAudit} 
                    disabled={isLoading || !transactions} 
                    className="w-full bg-ledger-cream text-military-green hover:bg-ledger-cream/80 font-bold"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Run Audit'}
                </Button>
            </div>
            
            {report && (
                <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                    <Card className="bg-black/20 border-military-green-foreground/30 text-military-green-foreground">
                        <CardHeader className="p-3">
                            <CardTitle className="text-base">Financial Atrocities Report</CardTitle>
                            <CardDescription className="text-military-green-foreground/70 italic">"{report.overallRoast}"</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 grid grid-cols-2 gap-4">
                            <BurnRateThermometer days={report.burnRateDays} />
                            <HealthScore score={report.financialHealthScore} />
                        </CardContent>
                    </Card>
                    <Accordion type="multiple" className="w-full">
                        <AccordionItem value="item-1" className="border-military-green-foreground/30">
                            <AccordionTrigger className="hover:no-underline font-bold">Line Item Interrogation</AccordionTrigger>
                            <AccordionContent className="p-0">
                                <div className="bg-black/10 rounded-b-md">
                                    {report.auditedTransactions.map((item, i) => (
                                    <React.Fragment key={i}>
                                            <AuditedTransactionItem item={item} />
                                            {i < report.auditedTransactions.length - 1 && <Separator className="bg-military-green/20" />}
                                    </React.Fragment>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-military-green-foreground/30 border-b-0">
                            <AccordionTrigger className="hover:no-underline font-bold text-destructive/80">Tax Evasion Simulator™</AccordionTrigger>
                            <AccordionContent className="text-sm italic p-2 rounded-md bg-black/20 text-military-green-foreground/80">
                                {report.irsAuditSimulation}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            )}
        </div>
    )
}
