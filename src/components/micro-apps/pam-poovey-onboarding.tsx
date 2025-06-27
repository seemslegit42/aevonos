'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generatePamOnboarding } from '@/app/actions';
import { type PamAudioOutput } from '@/ai/agents/pam-poovey';
import { Play, Loader2 } from 'lucide-react';

export default function PamPooveyOnboarding() {
  const [onboardingData, setOnboardingData] = useState<PamAudioOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setOnboardingData(null);
    const result = await generatePamOnboarding();
    setOnboardingData(result);
    setIsLoading(false);
  };
  
  React.useEffect(() => {
    if (onboardingData?.audioDataUri && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [onboardingData]);


  return (
    <div className="flex flex-col gap-4 p-2 h-full">
      {!onboardingData && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground text-sm mb-4">Ready for your no-BS onboarding? Don't cry.</p>
          <Button onClick={handleGenerate}>
            <Play className="mr-2 h-4 w-4" />
            Get the Lowdown
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
          <ScrollArea className="h-48 w-full rounded-md border p-4 bg-background/50">
            <p className="text-sm whitespace-pre-wrap">{onboardingData.script}</p>
          </ScrollArea>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Regenerate Spiel
          </Button>
          {onboardingData.audioDataUri && (
            <audio ref={audioRef} src={onboardingData.audioDataUri} controls className="w-full h-10 mt-2">
              Your browser does not support the audio element.
            </audio>
          )}
        </>
      )}
    </div>
  );
}
