
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, DollarSign, Send } from 'lucide-react';
import type { LucilleBluthOutput } from '@/ai/agents/lucille-bluth-schemas';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAppStore } from '@/store/app-store';
import { useToast } from '@/hooks/use-toast';

export default function TheLucilleBluth(props: LucilleBluthOutput | {}) {
  const { handleCommandSubmit, isLoading } = useAppStore(state => ({
    handleCommandSubmit: state.handleCommandSubmit,
    isLoading: state.isLoading
  }));
  const { toast } = useToast();

  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [result, setResult] = useState<LucilleBluthOutput | null>(null);

  useEffect(() => {
      if (props && 'judgmentalRemark' in props) {
          setResult(props);
      }
  }, [props]);


  const handleAnalysis = async () => {
    const amount = parseFloat(expenseAmount);
    if (!expenseDescription || isNaN(amount)) {
      toast({ variant: 'destructive', title: "Lucille is waiting...", description: "I can't judge you if you don't give me anything to work with. It's like you're not even trying to disappoint me." });
      return;
    }
    const command = `log an expense for ${expenseDescription} that cost ${amount}`;
    handleCommandSubmit(command);
    setExpenseDescription('');
    setExpenseAmount('');
  };

  return (
    <div className="p-2 space-y-3 h-full flex flex-col">
      <div className="flex-grow space-y-3 overflow-y-auto pr-1">
        <p className="text-xs text-muted-foreground italic">"Here's some money. Go see a star war."</p>
        <Card className="bg-background/50 p-3">
          <CardContent className="p-0 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Expense (e.g., 'Frozen Banana')"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                disabled={isLoading}
              />
              <Input
                type="number"
                placeholder="$10?"
                className="w-24"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" onClick={handleAnalysis} disabled={isLoading || !expenseDescription || !expenseAmount}>
              {isLoading ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" /> Log Expense</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Alert className="bg-background/80">
            <DollarSign className="h-4 w-4" />
            <AlertTitle>Lucille's Take</AlertTitle>
            <AlertDescription className="italic">
              "{result.judgmentalRemark}"
              {result.categorization && <span className="block not-italic text-xs text-muted-foreground mt-1">New Category: {result.categorization}</span>}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* MonetizationHook */}
      <div className="mt-auto pt-2 border-t border-border/50">
          <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <div className="flex items-center justify-between">
                          <Label htmlFor="portfolio-mode" className="text-sm">
                              Portfolio Review Mode
                          </Label>
                          <Switch id="portfolio-mode" disabled/>
                      </div>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p className="text-xs max-w-xs">Unlocks stock portfolio analysis. "There's always money in the banana stand." Requires Artisan plan.</p>
                  </TooltipContent>
              </Tooltip>
          </TooltipProvider>
      </div>
    </div>
  );
}
