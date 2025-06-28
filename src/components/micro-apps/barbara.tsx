
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, CheckCircle, XCircle, FileWarning, Banana } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { BarbaraOutput, BarbaraTask } from '@/ai/agents/barbara-schemas';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export default function Barbara(props: BarbaraOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const [documentText, setDocumentText] = useState('');
    const [task, setTask] = useState<BarbaraTask>('validate_vin_label');
    const [report, setReport] = useState<BarbaraOutput | null>(props && 'isApproved' in props ? props : null);
    const [successfulRuns, setSuccessfulRuns] = useState(0);
    const [bananaBreadMode, setBananaBreadMode] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (props && 'isApproved' in props) {
            setReport(props);
            if (props.isApproved) {
                setSuccessfulRuns(prev => prev + 1);
            }
        }
    }, [props]);

    useEffect(() => {
        if (successfulRuns >= 3 && !bananaBreadMode) {
            setBananaBreadMode(true);
            toast({
                title: "Barbara seems... pleased?",
                description: "Banana Bread Mode has been activated. Enjoy the brief moment of calm.",
                duration: 5000
            });
            // Reset after a while
            setTimeout(() => {
                setBananaBreadMode(false);
                setSuccessfulRuns(0);
            }, 30000);
        }
    }, [successfulRuns, bananaBreadMode, toast]);

    const handleSubmit = () => {
        if (!documentText) {
            toast({ variant: 'destructive', title: "Barbara is waiting.", description: "Provide a document. I don't have all day." });
            return;
        }
        const command = `ask barbara to ${task.replace(/_/g, ' ')} for this document: "${documentText}"`;
        handleCommandSubmit(command);
    };
    
    const ApprovalIcon = report?.isApproved ? CheckCircle : XCircle;

    return (
        <div className={cn("p-2 space-y-3 h-full flex flex-col rounded-lg transition-all duration-500", bananaBreadMode ? "bg-yellow-950/20" : "bg-secondary/20")}>
            <Card className="bg-background/50 border-border text-foreground">
                <CardHeader className="p-2">
                    <CardTitle className="text-base font-headline text-primary">Barbara: Compliance</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Submit documents for immediate, judgmental review.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Paste document text, VIN, or issue here..."
                        value={documentText}
                        onChange={(e) => setDocumentText(e.target.value)}
                        disabled={isLoading}
                        rows={3}
                        className="bg-background/80 border-border focus-visible:ring-primary"
                    />
                    <div className="flex gap-2">
                        <Select value={task} onValueChange={(v: any) => setTask(v)} disabled={isLoading}>
                            <SelectTrigger className="bg-background/80 border-border focus:ring-primary">
                                <SelectValue placeholder="Select Task..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="validate_vin_label">Validate VIN Label</SelectItem>
                                <SelectItem value="draft_customs_email">Draft Customs Email</SelectItem>
                                <SelectItem value="check_cmvss_compliance">Check CMVSS Compliance</SelectItem>
                                <SelectItem value="file_insurance_update">File Insurance Update</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="w-full" onClick={handleSubmit} disabled={isLoading || !documentText}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Submit for Review'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {report && (
                <Card className="bg-background/50 border-border text-foreground flex-grow overflow-y-auto">
                    <CardHeader className="p-2">
                        <CardTitle className="text-base text-primary flex justify-between items-center">
                            <span>Compliance Report</span>
                            <span className={cn("flex items-center gap-1 text-sm", report.isApproved ? "text-accent" : "text-destructive")}>
                                <ApprovalIcon className="h-4 w-4" />
                                {report.isApproved ? "Approved" : "Rejected"}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2 text-sm">
                         <Alert className="border-accent/50 bg-background/50">
                            <Wand2 className="h-4 w-4 text-accent"/>
                            <AlertTitle className="text-accent">Barbara's Remark</AlertTitle>
                            <AlertDescription className="text-foreground/80 italic">
                                "{report.judgmentalRemark}"
                            </AlertDescription>
                        </Alert>
                        {report.complianceIssues.length > 0 && (
                             <Alert variant="destructive">
                                <FileWarning className="h-4 w-4"/>
                                <AlertTitle>Compliance Issues Identified</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-5">
                                        {report.complianceIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                        {report.correctedText && (
                            <div>
                                <h4 className="font-semibold text-primary mb-1">Corrected Document:</h4>
                                <div className="p-2 bg-background/80 rounded-md border border-dashed border-border text-xs whitespace-pre-wrap">
                                    {report.correctedText}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            
            {bananaBreadMode && (
                 <Alert className="border-yellow-400/50 bg-yellow-950/50 text-yellow-200 animate-pulse">
                    <Banana className="h-4 w-4 text-yellow-400"/>
                    <AlertTitle>Banana Bread Mode Activated</AlertTitle>
                    <AlertDescription>
                        You’re doing fine, dear. Even you can’t break me.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
