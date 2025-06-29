
'use client';

import { cn } from "@/lib/utils";

const StonkPulse = ({ isPanic }: { isPanic: boolean }) => {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <div
        className={cn(
          'absolute h-full w-full animate-ping rounded-full opacity-75',
          isPanic ? 'bg-stonks-anxiety' : 'bg-stonks-green'
        )}
      ></div>
      <div
        className={cn(
          'relative inline-flex h-6 w-6 rounded-full',
          isPanic ? 'bg-stonks-anxiety' : 'bg-stonks-green'
        )}
      ></div>
    </div>
  );
};

export default StonkPulse;
