'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Bot } from 'lucide-react';
import type { DecoyInput, DecoyOutput } from '@/ai/agents/decoy-schemas';

interface DecoyDeploymentPanelProps {
    decoyResult: DecoyOutput | null;
}

export default function DecoyDeploymentPanel({ decoyResult }: DecoyDeploymentPanelProps) {
    const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading
    }));
    const { toast } = useToast();
    const [result, setResult] = useState<DecoyOutput | null>(decoyResult);
    const [targetDescription, setTargetDescription] = useState('');
    const [persona, setPersona] = useState<DecoyInput['persona']>('chill-demon');

    useEffect(() => {
        setResult(decoyResult);
    }, [decoyResult]);

    const handleDeploy = async () => {
      if (!targetDescription) {
          toast({ variant: 'destructive', title: "Intel Required", description: "The decoy needs a target description to proceed." });
          return;
      }
      const command = `deploy a decoy with persona "${persona}" to a target described as: "${targetDescription}"`;
      handleCommandSubmit(command);
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
        {result?.decoyMessage && (
            <Alert variant={result.decoyMessage.startsWith("Error:") ? "destructive" : "default"} className="mt-3 bg-background/80">
                <Bot className="h-4 w-4" />
                <AlertTitle>{result.decoyMessage.startsWith("Error:") ? "Deployment Failed" : "Decoy Message Generated"}</AlertTitle>
                <AlertDescription className={result.decoyMessage.startsWith("Error:") ? "" : "italic"}>
                    {result.decoyMessage.startsWith("Error:") ? result.decoyMessage : `"${result.decoyMessage}"`}
                </AlertDescription>
            </Alert>
        )}
      </div>
    );
};
