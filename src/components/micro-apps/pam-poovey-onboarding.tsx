
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type PamAudioOutput, type PamScriptInput } from '@/ai/agents/pam-poovey-schemas';
import { Play, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from '@/store/app-store';


export default function PamPooveyOnboarding(props: PamAudioOutput | {}) {
  const { handleCommandSubmit, isLoading } = useAppStore(state => ({
    handleCommandSubmit: state.handleCommandSubmit,
    isLoading: state.isLoading
  }));

  const [onboardingData, setOnboardingData] = useState<PamAudioOutput | null>(props && 'script' in props ? props : null);
  const [topic, setTopic] = useState<PamScriptInput['topic']>('onboarding');
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (props && 'script' in props) {
      setOnboardingData(props);
    }
  }, [props]);

  const handleGenerate = async () => {
    const command = `get pam poovey's take on the topic: ${topic}`;
    handleCommandSubmit(command);
  };
  
  React.useEffect(() => {
    if (onboardingData?.audioDataUri && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [onboardingData]);


  return (
    <div className="flex flex-col gap-4 p-2 h-full">
      <Select value={topic} onValueChange={(value: PamScriptInput['topic']) => setTopic(value)} disabled={isLoading}>
          <SelectTrigger>
              <SelectValue placeholder="Select a topic for Pam..." />
          </SelectTrigger>
          <SelectContent>
              <SelectItem value="onboarding">Onboarding Spiel</SelectItem>
              <SelectItem value="attendance_policy">Attendance "Reminder"</SelectItem>
              <SelectItem value="firing_someone">Termination Speech</SelectItem>
          </SelectContent>
      </Select>

      {!onboardingData && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground text-sm mb-4">Pick a topic. Let's get this over with.</p>
          <Button onClick={handleGenerate}>
            <Play className="mr-2 h-4 w-4" />
            Get Pam's Take
          </Button>
        </div>
      )}
      
      {isLoading && (
         <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Pam's thinking of something witty... or just pouring another drink.</p>
         </div>
      )}

      {onboardingData && (
        <>
          <ScrollArea className="h-32 w-full rounded-md border p-4 bg-background/50">
            <p className="text-sm whitespace-pre-wrap">{onboardingData.script}</p>
          </ScrollArea>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Get another one
          </Button>
          {onboardingData.audioDataUri && (
            <audio ref={audioRef} src={onboardingData.audioDataUri} controls className="w-full h-8 mt-1">
              Your browser does not support the audio element.
            </audio>
          )}
        </>
      )}
    </div>
  );
}
