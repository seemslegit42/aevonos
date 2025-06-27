'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Clipboard, FileText } from 'lucide-react';
import { analyzeCandidate as analyzeCandidateAction } from '@/app/actions';
import type { RolodexAnalysisOutput } from '@/ai/agents/rolodex-schemas';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';

export default function TheRolodex() {
  const [isLoading, setIsLoading] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateSummary, setCandidateSummary] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<RolodexAnalysisOutput | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!candidateSummary || !jobDescription) return;
    setIsLoading(true);
    setResult(null);
    const response = await analyzeCandidateAction({ 
        candidateName, 
        candidateSummary, 
        jobDescription 
    });
    setResult(response);
    setIsLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Icebreaker Copied',
      description: 'Ready to paste into your outreach email.',
    });
  };

  const isFormFilled = candidateSummary && jobDescription;

  return (
    <div className="p-2 space-y-3 h-full flex flex-col">
      <Card className="bg-background/50 border-0 shadow-none p-0">
        <CardHeader className="p-2">
            <CardTitle className="text-base">Candidate Analysis</CardTitle>
            <CardDescription className="text-xs">"Let's put a pin in that."</CardDescription>
        </CardHeader>
        <CardContent className="p-2 space-y-2">
            <Input 
                placeholder="Candidate Name (Optional)"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                disabled={isLoading}
                className="bg-background/80"
            />
            <Textarea
              placeholder="Paste candidate resume summary here..."
              value={candidateSummary}
              onChange={(e) => setCandidateSummary(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="bg-background/80"
            />
            <Textarea
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="bg-background/80"
            />
            <Button className="w-full" onClick={handleAnalysis} disabled={isLoading || !isFormFilled}>
              {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2"/>Analyze Fit</>}
            </Button>
        </CardContent>
      </Card>
      
      {result && (
        <div className="space-y-3 pt-2">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-primary">Fit Score</span>
                    <span className="text-lg font-bold text-primary">{result.fitScore}%</span>
                </div>
                <Progress value={result.fitScore} className="h-2 [&>div]:bg-primary" />
            </div>

            <Alert variant="default" className="bg-background/50">
              <FileText className="h-4 w-4" />
              <AlertTitle>Candidate Summary</AlertTitle>
              <AlertDescription>{result.summary}</AlertDescription>
            </Alert>
            
            <Alert variant="default" className="bg-background/50">
              <Clipboard className="h-4 w-4" />
              <AlertTitle className="flex justify-between items-center">
                  <span>Outreach Icebreaker</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(result.icebreaker)}>
                      <Clipboard className="h-3 w-3" />
                  </Button>
              </AlertTitle>
              <AlertDescription className="italic">"{result.icebreaker}"</AlertDescription>
            </Alert>
        </div>
      )}
    </div>
  );
}
