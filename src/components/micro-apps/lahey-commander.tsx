
'use client';

import React from 'react';
import { LaheyIcon } from '../icons/LaheyIcon';

export default function LaheyCommander() {
  return (
    <div className="p-4 h-full flex flex-col items-center justify-center text-center">
        <LaheyIcon className="w-24 h-24 text-muted-foreground/50 animate-pulse" />
        <h3 className="text-lg font-headline mt-4">Connecting to the Shit-Network...</h3>
        <p className="text-muted-foreground text-sm max-w-xs mt-1">
            *hic*... Stand by, bud. The liquor is processing the surveillance data.
        </p>
    </div>
  );
}
