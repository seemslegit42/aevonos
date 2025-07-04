
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lightbulb, ListChecks, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { DailyBriefingOutput } from '@/ai/agents/briefing-schemas';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface DailyBriefingWidgetProps {
    briefing: DailyBriefingOutput | null;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}

const BriefingSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
        </div>
         <Skeleton className="h-4 w-1/2" />
    </div>
);

export default function DailyBriefingWidget({ briefing, isLoading, error, onRefresh }: DailyBriefingWidgetProps) {
  const renderContent = () => {
    if (isLoading && !briefing) {
      return <BriefingSkeleton />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Briefing Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!briefing) {
      return <p className="text-sm text-muted-foreground">Briefing not available.</p>;
    }

    return (
      <div className="space-y-4 text-sm">
        <p className="font-semibold text-primary">{briefing.greeting}</p>
        <div>
          <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive"/> Key Alerts</h4>
          <ul className="list-disc pl-5 mt-1 text-muted-foreground">
            {briefing.key_alerts.map((alert, i) => <li key={i}>{alert}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold flex items-center gap-2"><ListChecks className="w-4 h-4 text-accent"/> Top Priorities</h4>
          <ul className="list-disc pl-5 mt-1 text-muted-foreground">
            {briefing.top_priorities.map((priority, i) => <li key={i}>{priority}</li>)}
          </ul>
        </div>
        <p className="italic text-muted-foreground">{briefing.closing_remark}</p>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5"/> Daily Briefing
          </CardTitle>
          <CardDescription>Your AI-generated morning update.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
