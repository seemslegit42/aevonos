
'use client';

import React from 'react';
import { CrystalIcon } from '@/components/icons/CrystalIcon';

export default function EmptyCanvas() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground animate-in fade-in-50 duration-500">
            <CrystalIcon className="w-24 h-24 text-primary/30 mb-4" />
            <h2 className="text-xl font-headline text-foreground">Canvas is Clear</h2>
            <p>Use the command bar above to get started.</p>
            <p className="text-xs mt-2">Try: "list all contacts" or "open the armory"</p>
        </div>
    )
}
