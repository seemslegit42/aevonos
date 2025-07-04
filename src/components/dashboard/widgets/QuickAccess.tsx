
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { ArmoryIcon } from '@/components/icons/ArmoryIcon';
import { LoomIcon } from '@/components/icons/LoomIcon';
import { Command } from 'lucide-react';

export default function QuickAccess() {
    const { upsertApp } = useAppStore();

    return (
        <Card className="bg-background/50">
            <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Command className="h-4 w-4" />
                    Core Functions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto flex flex-col gap-1 p-2" onClick={() => upsertApp('loom', { id: 'singleton-loom' })}>
                    <LoomIcon className="w-8 h-8"/>
                    <span className="text-xs">Loom Studio</span>
                </Button>
                <Button variant="outline" className="h-auto flex flex-col gap-1 p-2" onClick={() => upsertApp('armory', { id: 'singleton-armory' })}>
                    <ArmoryIcon className="w-8 h-8"/>
                    <span className="text-xs">The Armory</span>
                </Button>
            </CardContent>
        </Card>
    )
}
