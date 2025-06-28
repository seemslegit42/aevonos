
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Mic, ListChecks, ChevronsRight } from 'lucide-react';
import type { ForemanatorLogOutput } from '@/ai/agents/foremanator-schemas';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { useAppStore } from '@/store/app-store';

export default function TheForemanator(props: ForemanatorLogOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading
    }));
    const [logText, setLogText] = useState('');
    const [report, setReport] = useState<ForemanatorLogOutput | null>(props && 'summary' in props ? props : null);
    const { toast } = useToast();
    
    useEffect(() => {
        if (props && 'summary' in props) {
            setReport(props);
        }
    }, [props]);

    const handleSubmitLog = async () => {
        if (!logText) {
            toast({ variant: 'destructive', title: "Get to it!", description: "Can't file a report if there's nothin' in it." });
            return;
        }
        const command = `log this construction daily report: "${logText}"`;
        handleCommandSubmit(command);
        setLogText('');
    };

    return (
        <div className="p-2 space-y-3 h-full flex flex-col bg-secondary/20 border border-border/50 rounded-lg">
            <Card className="bg-secondary border-border text-secondary-foreground">
                <CardHeader className="p-2">
                    <CardTitle className="text-base text-primary font-headline">Daily Site Log</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">What'd you get done? Don't waste my time.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Example: 'Yo Foremanator, today we poured the east slab, framed the south wall, and Steve broke another hammer. We're out of 16-penny nails.'"
                        value={logText}
                        onChange={(e) => setLogText(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" disabled={isLoading}>
                            <Mic />
                        </Button>
                        <Button className="w-full" onClick={handleSubmitLog} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Submit Daily Log'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {report && (
                <Card className="bg-secondary border-border text-secondary-foreground flex-grow">
                    <CardHeader className="p-2">
                        <CardTitle className="text-base text-primary font-headline">Processed Report</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">{report.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2 text-sm">
                        <div>
                            <h4 className="font-bold text-primary/80">Tasks Completed:</h4>
                            <ul className="list-disc pl-5 text-secondary-foreground/90">
                                {report.tasksCompleted.map((task, i) => <li key={i}>{task}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-primary/80">Materials Used:</h4>
                            <ul className="list-disc pl-5 text-secondary-foreground/90">
                                {report.materialsUsed.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        {report.blockers.length > 0 && (
                            <div>
                                <h4 className="font-bold text-destructive">Blockers:</h4>
                                <ul className="list-disc pl-5 text-destructive/90">
                                    {report.blockers.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                        <Separator className="my-2 bg-border"/>
                        <Alert className="border-primary/50 bg-background/50">
                            <ChevronsRight className="h-4 w-4 text-primary"/>
                            <AlertTitle className="text-primary">Foremanator's Orders</AlertTitle>
                            <AlertDescription className="text-muted-foreground italic">
                                "{report.foremanatorCommentary}"
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
