
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { Quest } from '@/ai/agents/ritual-quests-schemas';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { RitualQuestsIcon } from '../icons/RitualQuestsIcon';

interface RitualQuestsProps {
  quests?: Quest[];
}

function QuestCard({ quest }: { quest: Quest }) {
  const { toast } = useToast();
  const handleBeginQuest = () => {
    navigator.clipboard.writeText(quest.command);
    toast({
      title: "Command Copied",
      description: "Paste the command into the BEEP bar to begin your quest.",
    });
  };

  return (
    <Card className="bg-background/50 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{quest.title}</CardTitle>
        <CardDescription className="text-xs">{quest.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <p className="text-lg font-bold text-gilded-accent">{quest.reward}</p>
        <Button size="sm" onClick={handleBeginQuest}>
          Begin Quest <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function RitualQuests(props: RitualQuestsProps) {
  const { handleCommandSubmit, isLoading, beepOutput } = useAppStore();
  const [quests, setQuests] = useState<Quest[] | null>(props.quests || null);

  useEffect(() => {
    if (!props.quests) {
      handleCommandSubmit("show me my ritual quests");
    }
  }, []);

  useEffect(() => {
    const report = beepOutput?.agentReports?.find(r => r.agent === 'ritual-quests');
    if (report) {
      setQuests(report.report.quests);
    }
  }, [beepOutput]);

  if (isLoading && !quests) {
    return (
      <div className="p-2 space-y-3 h-full">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="p-2 h-full flex flex-col gap-3">
      {quests && quests.length > 0 ? (
        <ScrollArea className="flex-grow pr-2 -mr-2">
          <div className="space-y-3">
            {quests.map((quest, i) => (
              <QuestCard key={i} quest={quest} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground">
          <RitualQuestsIcon className="w-24 h-24 text-primary/50" />
          <p className="mt-4 font-semibold">The Chronicler is consulting the archives...</p>
          <p className="text-xs">New quests will be revealed soon.</p>
        </div>
      )}
    </div>
  );
}
