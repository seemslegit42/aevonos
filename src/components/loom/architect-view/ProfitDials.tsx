'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { pulseEngineConfig } from '@/config/pulse-engine-config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

const Dial = ({ label, description, value, onValueChange, min, max, step, disabled = true }: { label: string, description: string, value: number, onValueChange: (val: number) => void, min: number, max: number, step: number, disabled?: boolean }) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <Label>{label}</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent><p>{description}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <div className="flex items-center gap-4">
            <Slider
                value={[value]}
                onValueChange={(v) => onValueChange(v[0])}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
            />
            <Input
                type="number"
                value={value}
                onChange={(e) => onValueChange(Number(e.target.value))}
                className="w-24 bg-background/80"
                min={min}
                max={max}
                step={step}
                disabled={disabled}
            />
        </div>
    </div>
);

export default function ProfitDials() {
    // In a real app, this state would be managed and mutations would call server actions
    const [config, setConfig] = useState(pulseEngineConfig);

    const handleConfigChange = (key: keyof typeof pulseEngineConfig, value: number) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Card className="bg-background/50 border-primary/30 h-full">
            <CardHeader>
                <CardTitle>Klepsydra Engine: Profit Dials</CardTitle>
                <CardDescription>Tune the fundamental physics of the ΞCredit economy. Changes are not yet live.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Dial 
                    label="Baseline Luck"
                    description="The raw, unadjusted probability of a 'win' event in any Folly Instrument."
                    value={config.BASE_LUCK}
                    onValueChange={(val) => handleConfigChange('BASE_LUCK', val)}
                    min={0.1} max={0.9} step={0.01}
                />
                <Dial 
                    label="Pity Threshold"
                    description="The number of consecutive losses a user can experience before the system grants a small, merciful boon."
                    value={config.PITY_THRESHOLD}
                    onValueChange={(val) => handleConfigChange('PITY_THRESHOLD', val)}
                    min={2} max={10} step={1}
                />
                 <Dial 
                    label="Crash Guard Threshold (%)"
                    description="The percentage drop in system-wide tribute velocity that triggers a global 'Festival of Fortune' event to re-engage users."
                    value={config.CRASH_GUARD_PERCENT}
                    onValueChange={(val) => handleConfigChange('CRASH_GUARD_PERCENT', val)}
                    min={5} max={50} step={1}
                />
            </CardContent>
        </Card>
    );
}
