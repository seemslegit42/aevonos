
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ListChecks, Check, X, FileDown } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { SterileishAnalysisInput, SterileishAnalysisOutput } from '@/ai/agents/sterileish-schemas';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export default function Sterileish(props: SterileishAnalysisOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading
    }));
    const [logText, setLogText] = useState('');
    const [entryType, setEntryType] = useState<SterileishAnalysisInput['entryType']>('general');
    const [report, setReport] = useState<SterileishAnalysisOutput | null>(props && 'isCompliant' in props ? props : null);
    const [auditMode, setAuditMode] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (props && 'isCompliant' in props) {
            setReport(props);
        }
    }, [props]);


    const handleSubmitLog = async () => {
        if (!logText) {
            toast({ variant: 'destructive', title: "Empty Log", description: "You need to actually write something, Janice." });
            return;
        }
        const command = `analyze this ${entryType} compliance log: "${logText}"`;
        handleCommandSubmit(command);
        setLogText('');
    };

    const ratingPercent = report ? report.sterileRating * 10 : 0;

    return (
        <div className="p-2 space-y-3 h-full flex flex-col bg-pale-green/10 border border-pale-green/50 rounded-lg">
            <Card className="bg-background/80 border-pale-green/50 text-foreground">
                <CardHeader className="p-2">
                    <CardTitle className="text-base text-pale-green font-headline">Cleanroom Log Entry</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">"It's probably fine."</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Log entry... e.g., 'Wiped down the laminar flow hood with 70% IPA. - B. Smith'"
                        value={logText}
                        onChange={(e) => setLogText(e.target.value)}
                        disabled={isLoading}
                        rows={3}
                        className="bg-background/80 border-border focus-visible:ring-pale-green"
                    />
                    <div className="flex gap-2">
                        <Select value={entryType} onValueChange={(v: any) => setEntryType(v)} disabled={isLoading}>
                            <SelectTrigger className="focus:ring-pale-green">
                                <SelectValue placeholder="Entry Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="calibration">Calibration</SelectItem>
                                <SelectItem value="environment">Environment</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="w-full" onClick={handleSubmitLog} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Analyze Log'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {report && (
                <Card className="bg-background/80 border-pale-green/50 text-foreground flex-grow">
                    <CardHeader className="p-2">
                        <CardTitle className="text-base text-pale-green font-headline">Compliance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2 text-sm">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-pale-green">Sanitation Level</span>
                                <span className="text-lg font-bold text-pale-green">{report.sterileRating.toFixed(1)}</span>
                            </div>
                            <Progress value={ratingPercent} className="h-2 [&>div]:bg-pale-green" />
                        </div>

                        <Alert className={report.isCompliant ? "border-pale-green/50" : "border-destructive/50"}>
                            {report.isCompliant ? <Check className="h-4 w-4 text-pale-green"/> : <X className="h-4 w-4 text-destructive"/>}
                            <AlertTitle className={report.isCompliant ? "text-pale-green" : "text-destructive"}>
                                {report.isCompliant ? "Basically Compliant" : "Compliance Issue Flagged"}
                            </AlertTitle>
                            <AlertDescription className="text-foreground/80 italic">
                                {report.complianceNotes}
                            </AlertDescription>
                        </Alert>

                        <Alert className="border-pale-green/50 bg-background/50">
                            <ListChecks className="h-4 w-4 text-pale-green"/>
                            <AlertTitle className="text-pale-green">Audit Summary</AlertTitle>
                            <AlertDescription className="text-muted-foreground italic">
                                "{report.snarkySummary}"
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

             <div className="flex-shrink-0 pt-2 border-t border-border/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Switch id="audit-mode" checked={auditMode} onCheckedChange={setAuditMode} />
                    <Label htmlFor="audit-mode">Audit Mode</Label>
                </div>
                <Button variant="ghost" disabled={!auditMode}>
                    <FileDown className="mr-2"/> Export for Auditor
                </Button>
            </div>
        </div>
    );
}
