
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MessageSquareQuote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { useAppStore } from '@/store/app-store';
import type { WinstonWolfeOutput } from '@/ai/agents/winston-wolfe-schemas';

export default function TheWinstonWolfe(props: WinstonWolfeOutput | {}) {
  const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading
  }));
  const { toast } = useToast();
  
  const [reviewText, setReviewText] = useState('');
  const [result, setResult] = useState<WinstonWolfeOutput | null>(props && 'suggestedResponse' in props ? props : null);

  useEffect(() => {
    if (props && 'suggestedResponse' in props) {
      setResult(props);
    }
  }, [props]);


  const handleGenerateSolution = async () => {
    if (!reviewText) {
        toast({ variant: 'destructive', title: "The Fixer is waiting.", description: "I can't solve a problem that isn't here." });
        return;
    }
    const command = `solve this negative review: "${reviewText}"`;
    handleCommandSubmit(command);
  };
  
  return (
    <div className="p-2 h-full flex flex-col space-y-3">
        <Card className="bg-background/50">
            <CardHeader className="p-2">
                <CardTitle className="text-base">The Fixer: Reputation Management</CardTitle>
                <CardDescription className="text-xs italic">"I solve problems."</CardDescription>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
                <Textarea 
                    placeholder="Paste the negative review here..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    className="bg-background/80"
                />
                <Button className="w-full" onClick={handleGenerateSolution} disabled={isLoading || !reviewText}>
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Call The Fixer'}
                </Button>
            </CardContent>
        </Card>
        
        {result?.suggestedResponse && (
            <Alert className="bg-background/50 border-accent flex-grow">
                <MessageSquareQuote className="h-4 w-4" />
                <AlertTitle>Suggested Response</AlertTitle>
                <AlertDescription className="italic text-foreground/90">
                    {result.suggestedResponse}
                </AlertDescription>
            </Alert>
        )}
    </div>
  );
}
