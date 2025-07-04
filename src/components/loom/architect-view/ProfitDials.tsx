
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, SlidersHorizontal, Activity, Loader2, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import EconomicPulseChart from './EconomicPulseChart';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { debounce } from 'lodash';

type Config = {
    pityThreshold: number;
    festivalTriggerPercent: number;
    transmutationTithe: number;
}

const Dial = ({ label, description, value, onValueChange, min, max, step }: { label: string, description: string, value: number, onValueChange: (val: number) => void, min: number, max: number, step: number }) => (
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
            />
            <Input
                type="number"
                value={value}
                onChange={(e) => onValueChange(Number(e.target.value))}
                className="w-24 bg-background/80"
                min={min}
                max={max}
                step={step}
            />
        </div>
    </div>
);

const LoadingSkeleton = () => (
     <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-4">
                <Skeleton className="h-5 flex-grow" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
        <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-4">
                <Skeleton className="h-5 flex-grow" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
         <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-4">
                <Skeleton className="h-5 flex-grow" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
        <Skeleton className="h-10 w-full" />
     </div>
);

export default function ProfitDials() {
    const [config, setConfig] = useState<Config | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/config/pulse-engine');
                if (!res.ok) throw new Error('Failed to fetch economic parameters.');
                const data: Config = await res.json();
                setConfig(data);
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, [toast]);

    const handleConfigChange = (key: keyof Config, value: number) => {
        setConfig(prev => prev ? { ...prev, [key]: value } : null);
    };

    const handleSave = debounce(async () => {
        if (!config) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/config/pulse-engine', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
             if (!res.ok) throw new Error('Failed to save economic parameters.');
             const data = await res.json();
             setConfig(data);
             toast({ title: 'Success', description: 'Economic parameters updated.' });
        } catch(error) {
             toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    }, 500);


    return (
        <Card className="bg-background/50 border-primary/30 h-full overflow-y-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="w-6 h-6"/>
                    Klepsydra Engine: Profit Dials
                </CardTitle>
                <CardDescription>Tune the fundamental physics of the ΞCredit economy. Changes are saved automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading || !config ? <LoadingSkeleton /> : (
                    <>
                        <Dial 
                            label="Pity Threshold"
                            description="The number of consecutive losses a user can experience before the system grants a small, merciful boon."
                            value={config.pityThreshold}
                            onValueChange={(val) => {
                                handleConfigChange('pityThreshold', val);
                                handleSave();
                            }}
                            min={2} max={15} step={1}
                        />
                         <Dial 
                            label="Festival Trigger Threshold (%)"
                            description="The percentage drop in system-wide tribute velocity that triggers a global 'Festival of Fortune' event to re-engage users."
                            value={config.festivalTriggerPercent}
                            onValueChange={(val) => {
                                handleConfigChange('festivalTriggerPercent', val)
                                handleSave();
                            }}
                            min={5} max={50} step={1}
                        />
                         <Dial 
                            label="Transmutation Tithe (%)"
                            description="The commission fee Obelisk Pay takes on every real-world transmutation via the Proxy.Agent."
                            value={config.transmutationTithe * 100}
                            onValueChange={(val) => {
                                handleConfigChange('transmutationTithe', val / 100)
                                handleSave();
                            }}
                            min={1} max={50} step={1}
                        />
                        {isSaving && (
                            <div className="flex items-center text-sm text-muted-foreground justify-end gap-2">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                Saving...
                            </div>
                        )}
                    </>
                )}
            </CardContent>

            <Separator className="my-4" />

            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-6 h-6"/>
                    Economic Pulse
                </CardTitle>
                <CardDescription>Last 30 days of ΞCredit economic activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <EconomicPulseChart />
            </CardContent>
        </Card>
    );
}
