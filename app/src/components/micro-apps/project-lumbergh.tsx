'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, ThumbsDown, Loader2, Save } from 'lucide-react';
import type { LumberghAnalysisOutput } from '@/ai/agents/lumbergh-schemas';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';

export default function ProjectLumbergh(props: LumberghAnalysisOutput | {}) {
  const { handleCommandSubmit, isLoading } = useAppStore(state => ({
    handleCommandSubmit: state.handleCommandSubmit,
    isLoading: state.isLoading
  }));
  
  const [inviteText, setInviteText] = useState('');
  const [result, setResult] = useState<LumberghAnalysisOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (props && 'isFlagged' in props) {
        setResult(props);
    }
  }, [props]);

  const handleAnalysis = async () => {
    if (!inviteText) return;
    const command = `analyze this meeting invite: "${inviteText}"`;
    handleCommandSubmit(command);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Memo Copied',
      description: 'Yeah, I\'m gonna need you to go ahead and paste that into an email. That\'d be greeeat.',
    });
  };

  return (
    <div className="p-2 space-y-3 h-full flex flex-col">
      <div className="flex-grow space-y-3 overflow-y-auto pr-1">
        <Textarea
          placeholder="Yeeeeah, if you could just go ahead and paste that meeting invite text in here, that'd be greeeat..."
          value={inviteText}
          onChange={(e) => setInviteText(e.target.value)}
          disabled={isLoading}
          rows={4}
          className="bg-background/50"
        />
        <Button className="w-full" onClick={handleAnalysis} disabled={isLoading || !inviteText}>
          {isLoading ? <Loader2 className="animate-spin" /> : <>Analyze Invite</>}
        </Button>

        {result && (
          <div className="space-y-3 pt-2">
            <Alert variant={result.isFlagged ? "destructive" : "default"} className={cn("bg-background/50", !result.isFlagged && "border-accent")}>
              <ThumbsDown className="h-4 w-4" />
              <AlertTitle className="font-bold">{result.isFlagged ? "Meeting Flagged" : "Meeting Seems Fine, I Guess"}</AlertTitle>
              <AlertDescription>{result.flagReason}</AlertDescription>
            </Alert>

            {result.isFlagged && result.declineMemos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Decline Memos:</h4>
                {result.declineMemos.map((memo, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-md border bg-background/50 text-xs italic text-muted-foreground">
                    <p className="flex-grow">"{memo}"</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleCopy(memo)}>
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* MonetizationHook */}
      <div className="mt-auto pt-2 border-t border-border/50">
          <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <div className="flex items-center justify-between">
                          <Label htmlFor="red-stapler-mode" className="text-sm flex items-center gap-2">
                              <Save className="h-4 w-4 text-destructive" />
                              Red Stapler Mode
                          </Label>
                          <Switch id="red-stapler-mode" disabled/>
                      </div>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p className="text-xs max-w-xs">When activated, automatically declines meetings from anyone but your direct supervisor. Requires Artisan plan or higher.</p>
                  </TooltipContent>
              </Tooltip>
          </TooltipProvider>
      </div>
    </div>
  );
}
