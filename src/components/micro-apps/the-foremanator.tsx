
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Mic, ListChecks, ChevronsRight } from 'lucide-react';
import { handleForemanatorLog } from '@/app/actions';
import type { ForemanatorLogOutput } from '@/ai/agents/foremanator-schemas';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

export default function TheForemanator() {
    const [isLoading, setIsLoading] = useState(false);
    const [logText, setLogText] = useState('');
    const [report, setReport] = useState<ForemanatorLogOutput | null>(null);
    const { toast } = useToast();

    const handleSubmitLog = async () => {
        if (!logText) {
            toast({ variant: 'destructive', title: "Get to it!", description: "Can't file a report if there's nothin' in it." });
            return;
        }
        setIsLoading(true);
        setReport(null);
        const response = await handleForemanatorLog({ logText });
        setReport(response);
        setIsLoading(false);
        setLogText('');
    };

    return (
        <div className="p-2 space-y-3 h-full flex flex-col bg-yellow-950/20 border border-yellow-400/20 rounded-lg">
            <Card className="bg-black/20 border-yellow-400/30 text-yellow-50">
                <CardHeader className="p-2">
                    <CardTitle className="text-base text-yellow-400 font-headline">Daily Site Log</CardTitle>
                    <CardDescription className="text-xs text-yellow-50/70">What'd you get done? Don't waste my time.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Example: 'Yo Foremanator, today we poured the east slab, framed the south wall, and Steve broke another hammer. We're out of 16-penny nails.'"
                        value={logText}
                        onChange={(e) => setLogText(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                        className="bg-black/30 border-yellow-400/50 text-yellow-50 placeholder:text-yellow-50/50 focus-visible:ring-yellow-400"
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10" disabled={isLoading}>
                            <Mic />
                        </Button>
                        <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300" onClick={handleSubmitLog} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Submit Daily Log'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {report && (
                <Card className="bg-black/20 border-yellow-400/30 text-yellow-50 flex-grow">
                    <CardHeader className="p-2">
                        <CardTitle className="text-base text-yellow-400 font-headline">Processed Report</CardTitle>
                        <CardDescription className="text-xs text-yellow-50/70">{report.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2 text-sm">
                        <div>
                            <h4 className="font-bold text-yellow-400/80">Tasks Completed:</h4>
                            <ul className="list-disc pl-5 text-yellow-50/90">
                                {report.tasksCompleted.map((task, i) => <li key={i}>{task}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-yellow-400/80">Materials Used:</h4>
                            <ul className="list-disc pl-5 text-yellow-50/90">
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
                        <Separator className="my-2 bg-yellow-400/30"/>
                        <Alert className="border-yellow-400/50 bg-black/10">
                            <ChevronsRight className="h-4 w-4 text-yellow-400"/>
                            <AlertTitle className="text-yellow-400">Foremanator's Orders</AlertTitle>
                            <AlertDescription className="text-yellow-50/80 italic">
                                "{report.foremanatorCommentary}"
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
