
'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Lock, Unlock, Gavel, FileDown, FileJson, Copy, Loader2 } from 'lucide-react';
import type { DossierOutput } from '@/ai/agents/dossier-schemas';
import type { OsintOutput } from '@/ai/agents/osint-schemas';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import type { DecoyOutput } from '@/ai/agents/decoy-schemas';

interface DossierExportPanelProps {
    report: DossierOutput;
    osintReport: OsintOutput | null;
    analysisResult: InfidelityAnalysisOutput | null;
    decoyResult: DecoyOutput | null;
    targetName: string;
    isLegal?: boolean;
}

export default function DossierExportPanel({ 
    report, 
    osintReport, 
    analysisResult, 
    decoyResult, 
    targetName,
    isLegal = false,
}: DossierExportPanelProps) {
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
                        osintReport: osintReport || undefined,
                        analysisResult: analysisResult || undefined,
                        decoyResult: decoyResult || undefined,
                        redacted: false,
                        mode: isLegal ? 'legal' : 'standard',
                        preparedFor: isLegal ? "Attorney Review // Case #AR-2024-889" : undefined,
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

    const handleCopyHash = () => {
        if (report.reportHash) {
            navigator.clipboard.writeText(report.reportHash);
            toast({ title: "Hash Copied", description: "SHA256 integrity hash copied to clipboard."});
        }
    }


    return (
        <Card className={cn("border-primary/50", isLegal ? "bg-destructive/10 border-destructive/50" : "bg-primary/10")}>
            <CardHeader className="p-2">
                <CardTitle className={cn("text-base flex items-center gap-2", isLegal ? "text-destructive" : "text-primary")}>
                    {isLegal && <Gavel />}
                    {isLegal ? "Legal Dossier Ready" : "Dossier Ready for Export"}
                </CardTitle>
                <CardDescription className="text-xs">
                     {isLegal ? "“Prepared for legal review.”" : "“When suspicion becomes evidence, it gets a cover page.”"}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-2 space-y-3">
                <div className="bg-background/80 p-2 rounded-md max-h-40 overflow-y-auto border border-dashed backdrop-blur-sm filter blur-sm select-none pointer-events-none">
                    <pre className="text-xs whitespace-pre-wrap font-sans opacity-50">
                        {report.markdownContent.substring(0, 500)}...
                    </pre>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Switch id={`encrypt-switch-${isLegal}`} checked={isEncrypted} onCheckedChange={setIsEncrypted} />
                        <Label htmlFor={`encrypt-switch-${isLegal}`} className="flex items-center gap-1">
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
                    <Button variant={isLegal ? "destructive" : "secondary"} className="w-full" disabled={isExporting} onClick={() => handleExport('pdf')}>
                        {isExporting ? <Loader2 className="animate-spin" /> : <><FileDown className="mr-2" /> {isLegal ? 'Unlock Legal PDF (499 Ξ)' : 'Unlock PDF (199 Ξ)'}</>}
                    </Button>
                     <Button variant="outline" className="w-full" disabled={isExporting} onClick={() => handleExport('json')}>
                        {isExporting ? <Loader2 className="animate-spin" /> : <><FileJson className="mr-2" /> {isLegal ? '+ Forensic JSON (299 Ξ)' : '+ JSON (99 Ξ)'}</>}
                    </Button>
                </div>
            </CardContent>
            {report.reportHash && (
                 <CardContent className="p-2 pt-0">
                    <div className="flex items-center gap-2 w-full bg-background/50 p-1 rounded">
                        <p className="text-xs text-muted-foreground font-mono w-full truncate" title={report.reportHash}>
                            SHA256: {report.reportHash}
                        </p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleCopyHash}>
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    )
};
