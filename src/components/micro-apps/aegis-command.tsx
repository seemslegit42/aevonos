
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, PlusCircle, Save, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';

type ThreatFeed = {
    id: string;
    url: string;
};

type SecurityEdict = {
    id: string;
    description: string;
    isActive: boolean;
};

const ThreatFeedsPanel = () => {
    const [feeds, setFeeds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchFeeds = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/security/threat-feeds');
                if (!response.ok) throw new Error('Failed to fetch threat feeds');
                const data: ThreatFeed[] = await response.json();
                setFeeds(data.map(f => f.url));
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeeds();
    }, [toast]);

    const handleFeedChange = (index: number, value: string) => {
        const newFeeds = [...feeds];
        newFeeds[index] = value;
        setFeeds(newFeeds);
    };

    const handleAddFeed = () => setFeeds([...feeds, '']);
    const handleRemoveFeed = (index: number) => setFeeds(feeds.filter((_, i) => i !== index));

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const validFeeds = feeds.filter(f => f.trim() !== '' && f.startsWith('https://'));
        
        try {
            const response = await fetch('/api/security/threat-feeds', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feeds: validFeeds }),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 const specificError = errorData.issues?.[0]?.message || errorData.error || 'Failed to save feeds.';
                 throw new Error(specificError);
            }
            toast({ title: 'Success', description: 'Threat intelligence feeds have been updated.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Save Error', description: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="space-y-3 h-full flex flex-col">
            {isLoading ? (
                <div className="space-y-3 flex-grow">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : (
                <ScrollArea className="flex-grow space-y-2 pr-2">
                    {feeds.map((feed, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <Input value={feed} onChange={(e) => handleFeedChange(index, e.target.value)} placeholder="https://threat.source/feed.json" className="bg-background/80" />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFeed(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={handleAddFeed}><PlusCircle className="mr-2" /> Add Feed</Button>
                </ScrollArea>
            )}
             <div className="flex-shrink-0 pt-2 border-t border-border/50">
                 <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Save Feeds</>}
                </Button>
            </div>
        </div>
    )
}

const SecurityEdictsPanel = () => {
    const [edicts, setEdicts] = useState<Partial<SecurityEdict>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

     useEffect(() => {
        const fetchEdicts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/security/edicts');
                if (!response.ok) throw new Error('Failed to fetch security edicts');
                const data: SecurityEdict[] = await response.json();
                setEdicts(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchEdicts();
    }, [toast]);
    
    const handleEdictChange = (index: number, field: 'description' | 'isActive', value: string | boolean) => {
        const newEdicts = [...edicts];
        (newEdicts[index] as any)[field] = value;
        setEdicts(newEdicts);
    };

    const handleAddEdict = () => setEdicts([...edicts, { description: '', isActive: true }]);
    const handleRemoveEdict = (index: number) => setEdicts(edicts.filter((_, i) => i !== index));

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const validEdicts = edicts.filter(e => e.description?.trim()).map(e => ({ description: e.description!, isActive: e.isActive ?? true }));

        try {
            const response = await fetch('/api/security/edicts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ edicts: validEdicts }),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 const specificError = errorData.issues?.[0]?.message || errorData.error || 'Failed to save edicts.';
                 throw new Error(specificError);
            }
            toast({ title: 'Success', description: 'Security edicts have been updated.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Save Error', description: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    };
    
     return (
        <div className="space-y-3 h-full flex flex-col">
            {isLoading ? (
                <div className="space-y-3 flex-grow">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : (
                <ScrollArea className="flex-grow space-y-2 pr-2">
                    {edicts.map((edict, index) => (
                        <div key={edict.id || index} className="flex items-start gap-2 mb-2 p-2 border rounded-md bg-background/50">
                            <Textarea value={edict.description} onChange={(e) => handleEdictChange(index, 'description', e.target.value)} placeholder="Describe a security rule..." className="bg-background/80 flex-grow" rows={2}/>
                            <div className="flex flex-col items-center gap-2">
                                <Switch checked={edict.isActive} onCheckedChange={(c) => handleEdictChange(index, 'isActive', c)} />
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveEdict(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={handleAddEdict}><PlusCircle className="mr-2" /> Add Edict</Button>
                </ScrollArea>
            )}
             <div className="flex-shrink-0 pt-2 border-t border-border/50">
                 <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Save Edicts</>}
                </Button>
            </div>
        </div>
    )
}

export default function AegisCommand() {
    return (
        <div className="p-2 h-full">
            <Tabs defaultValue="feeds" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="feeds">Threat Feeds</TabsTrigger>
                    <TabsTrigger value="edicts">Security Edicts</TabsTrigger>
                </TabsList>
                <TabsContent value="feeds" className="flex-grow mt-2">
                    <ThreatFeedsPanel />
                </TabsContent>
                <TabsContent value="edicts" className="flex-grow mt-2">
                    <SecurityEdictsPanel />
                </TabsContent>
            </Tabs>
        </div>
    );
}
