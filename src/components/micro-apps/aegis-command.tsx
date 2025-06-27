'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, PlusCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

type ThreatFeed = {
    id: string;
    url: string;
};

export default function AegisCommand() {
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

    const handleAddFeed = () => {
        setFeeds([...feeds, '']);
    };

    const handleRemoveFeed = (index: number) => {
        setFeeds(feeds.filter((_, i) => i !== index));
    };

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
                 // Attempt to find a more specific error message from Zod issues
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
    
    if (isLoading) {
        return (
            <div className="p-2 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        )
    }

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                {feeds.map((feed, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            value={feed}
                            onChange={(e) => handleFeedChange(index, e.target.value)}
                            placeholder="https://threat.source/feed.json"
                            className="bg-background/80"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFeed(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" className="w-full border-dashed" onClick={handleAddFeed}>
                    <PlusCircle className="mr-2" /> Add Feed
                </Button>
            </div>
            <div className="flex-shrink-0 pt-2 border-t border-border/50">
                 <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Save Changes</>}
                </Button>
            </div>
        </div>
    );
}
