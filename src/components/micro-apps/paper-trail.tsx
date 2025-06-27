
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, FileUp, ThumbsUp, X } from 'lucide-react';
import { scanEvidence } from '@/app/actions';
import type { PaperTrailScanOutput } from '@/ai/agents/paper-trail-schemas';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const caseFileId = `CASE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

export default function PaperTrail(props: { evidenceLog?: PaperTrailScanOutput[] } | {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [evidenceLog, setEvidenceLog] = useState<PaperTrailScanOutput[]>(props && 'evidenceLog' in props ? props.evidenceLog! : []);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!preview) return;
    setIsLoading(true);

    try {
        const result = await scanEvidence({ receiptPhotoUri: preview, caseFile: caseFileId });
        if (result.isEvidenceValid) {
            setEvidenceLog(prev => [result, ...prev]);
            toast({
                title: "Evidence Logged",
                description: `Informant's lead on ${result.vendor} has been added to the case file.`
            });
        } else {
            toast({
                variant: "destructive",
                title: "Invalid Evidence",
                description: result.lead,
            })
        }
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "The informant is offline. Probably a server error."
        })
    }
    
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsLoading(false);
  };
  
  return (
    <div className="p-2 space-y-3 h-full flex flex-col">
        <Card className="bg-background/50 border-border/50">
            <CardHeader className="p-2 pb-0">
                <CardTitle className="text-base font-mono flex justify-between">
                    <span>{caseFileId}</span>
                    <Badge variant="outline">OPEN</Badge>
                </CardTitle>
                <CardDescription className="text-xs">The Chicago Business Trip Case</CardDescription>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="mr-2"/>
                        Add Evidence
                    </Button>
                    <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <Button className="flex-1" onClick={handleScan} disabled={!preview || isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><FileUp className="mr-2"/>File It</>}
                    </Button>
                </div>
                {preview && (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden border-2 border-dashed border-primary/50">
                        <Image src={preview} alt="Receipt preview" layout="fill" objectFit="contain" />
                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 z-10" onClick={() => setPreview(null)}><X className="h-4 w-4"/></Button>
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="flex-grow space-y-2 overflow-y-auto pr-1">
            {evidenceLog.map((item, index) => (
                <Alert key={index} className="bg-background/50">
                    <ThumbsUp className="h-4 w-4" />
                    <AlertTitle className="text-sm flex justify-between">
                        <span>{item.vendor} - <span className="font-mono">${item.amount.toFixed(2)}</span></span>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                    </AlertTitle>
                    <AlertDescription className="text-xs italic">
                        LEAD: {item.lead}
                    </AlertDescription>
                </Alert>
            ))}
        </div>

        <Separator />
        <Button variant="secondary" disabled={evidenceLog.length === 0}>Close Case File</Button>
    </div>
  );
}
