'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, PlusCircle, Calendar, HeartCrack, Skull, ShieldQuestion, Drama, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { LoggedEvent, LoggedEventCategory } from '@/ai/agents/patrickt-agent-schemas';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatricktIcon } from '../icons/PatricktIcon';


// Mocked Data for UI
const mockEvents: LoggedEvent[] = [
    { id: '1', date: new Date(Date.now() - 86400000).toISOString(), category: 'CLASSIC_CHAOS', description: 'Showed up to family dinner an hour late, covered in glitter. No explanation.', martyrPoints: 12 },
    { id: '2', date: new Date(Date.now() - 172800000).toISOString(), category: 'FRIEND_BETRAYALS', description: 'Borrowed my car to "get groceries", returned it with a new dent and half a tank of gas missing.', martyrPoints: 18 },
    { id: '3', date: new Date(Date.now() - 259200000).toISOString(), category: 'REDEMPTION_ATTEMPTS', description: 'Actually apologized for the car thing. Brought me a six-pack as a peace offering.', martyrPoints: 5 },
];

const categoryConfig: Record<LoggedEventCategory, {icon: React.ElementType, color: string}> = {
    DRUG_DEALS: { icon: Skull, color: 'text-purple-400' },
    FRIEND_BETRAYALS: { icon: HeartCrack, color: 'text-orange-400' },
    GIRLFRIEND_DRAMA: { icon: Drama, color: 'text-pink-400' },
    CLASSIC_CHAOS: { icon: ShieldQuestion, color: 'text-yellow-400' },
    REDEMPTION_ATTEMPTS: { icon: Sparkles, color: 'text-accent' },
}

// Main Component
export default function PatricktApp() {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const { toast } = useToast();
    const [events, setEvents] = useState<LoggedEvent[]>(mockEvents);
    const [newEventDesc, setNewEventDesc] = useState('');
    const [newEventCategory, setNewEventCategory] = useState<LoggedEventCategory>('CLASSIC_CHAOS');
    
    const totalMartyrPoints = events.reduce((acc, event) => acc + event.martyrPoints, 0);
    const forgivenessBalance = 100 - (events.filter(e => e.category !== 'REDEMPTION_ATTEMPTS').length * 5) + (events.filter(e => e.category === 'REDEMPTION_ATTEMPTS').length * 10);

    const handleLogEvent = () => {
        if (!newEventDesc) {
            toast({ variant: 'destructive', title: 'Seriously?', description: "You gotta at least describe the fuck-up."});
            return;
        }
        // This is a mock interaction for the UI. Real logging would go through the agent.
        const newEvent: LoggedEvent = {
            id: (events.length + 1).toString(),
            date: new Date().toISOString(),
            category: newEventCategory,
            description: newEventDesc,
            martyrPoints: (newEventDesc.length % 10) + 5,
        };
        setEvents([newEvent, ...events]);
        setNewEventDesc('');
        toast({ title: 'Legend Logged', description: `You've earned ${newEvent.martyrPoints} Martyr Points. You're a saint.` });
    };

    return (
        <div className="p-2 h-full flex flex-col gap-3 bg-[#100a0a] border border-destructive/50 rounded-lg text-gray-200">
            <Card className="bg-transparent border-destructive/30">
                 <CardHeader className="p-2">
                    <CardTitle className="text-base text-destructive flex items-center gap-2">
                        <PatricktIcon className="w-5 h-5" />
                        Add Legendary Moment
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Log the latest act of glorious mayhem..."
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        disabled={isLoading}
                        rows={2}
                        className="bg-[#1a1010] border-destructive/50 text-gray-200 placeholder:text-gray-500 focus-visible:ring-destructive"
                    />
                    <div className="flex gap-2">
                        <Select value={newEventCategory} onValueChange={(v: any) => setNewEventCategory(v)} disabled={isLoading}>
                            <SelectTrigger className="bg-[#1a1010] border-destructive/50 text-gray-200 focus:ring-destructive">
                                <SelectValue placeholder="Category..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CLASSIC_CHAOS">Classic Chaos</SelectItem>
                                <SelectItem value="FRIEND_BETRAYALS">Friend Betrayal</SelectItem>
                                <SelectItem value="GIRLFRIEND_DRAMA">Girlfriend Drama</SelectItem>
                                <SelectItem value="DRUG_DEALS">Drug Deals</SelectItem>
                                <SelectItem value="REDEMPTION_ATTEMPTS">Redemption Attempt</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="destructive" className="w-full" onClick={handleLogEvent} disabled={isLoading || !newEventDesc}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Log It'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-transparent border-destructive/30 text-center p-2">
                    <p className="text-xs text-destructive/80">Martyr Points™</p>
                    <p className="text-3xl font-bold font-headline">{totalMartyrPoints}</p>
                </Card>
                 <Card className="bg-transparent border-destructive/30 text-center p-2">
                    <p className="text-xs text-destructive/80">Forgiveness Bank</p>
                    <div className="flex items-center gap-2 justify-center">
                        <p className="text-3xl font-bold font-headline">{forgivenessBalance}%</p>
                    </div>
                    <Progress value={forgivenessBalance} className="h-1 bg-destructive/20" indicatorClassName="bg-destructive" />
                </Card>
            </div>

            <Card className="bg-transparent border-destructive/30 flex-grow overflow-y-auto">
                <CardHeader className="p-2">
                    <CardTitle className="text-base text-destructive/90">The Saga</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <ScrollArea className="h-48">
                        <div className="space-y-3 pr-2">
                            {events.map(event => {
                                const ConfIcon = categoryConfig[event.category].icon;
                                return (
                                    <div key={event.id} className="text-xs p-2 rounded-md border border-destructive/20 bg-[#1a1010]/50">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className={cn("flex items-center gap-1 font-bold", categoryConfig[event.category].color)}>
                                                <ConfIcon className="w-3 h-3" />
                                                <span>{event.category.replace('_', ' ')}</span>
                                            </div>
                                            <span className="text-gray-400">{formatDistanceToNow(new Date(event.date), {addSuffix: true})}</span>
                                        </div>
                                        <p>{event.description}</p>
                                        <p className="text-right font-mono text-destructive/80 text-[10px] mt-1">+{event.martyrPoints} MP</p>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
