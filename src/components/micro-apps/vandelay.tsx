
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Calendar, Users, Wand2, Copy } from 'lucide-react';
import type { VandelayAlibiOutput } from '@/ai/agents/vandelay-schemas';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { useAppStore } from '@/store/app-store';

export default function Vandelay(props: { alibi?: VandelayAlibiOutput } | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading
    }));
    const [alibi, setAlibi] = useState<VandelayAlibiOutput | null>(props && 'alibi' in props ? props.alibi : null);
    const [addAttendees, setAddAttendees] = useState(false);
    const [topicHint, setTopicHint] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (props && 'alibi' in props) {
            setAlibi(props.alibi);
        }
    }, [props]);

    const handleCreateAlibi = async () => {
        let command = `create an alibi`;
        if (topicHint) {
            command += ` about "${topicHint}"`;
        }
        if (addAttendees) {
            command += ` and add plausible attendees`;
        }
        handleCommandSubmit(command);
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to Clipboard",
            description: "Your alibi is ready for pasting.",
        });
    }

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <Card className="bg-background/50 border-0 shadow-none p-0">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Vandelay Industries</CardTitle>
                    <CardDescription className="text-xs">Architecting your availability.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-3">
                    <Input 
                        placeholder="Optional: Topic hint (e.g., design review)"
                        value={topicHint}
                        onChange={(e) => setTopicHint(e.target.value)}
                        disabled={isLoading}
                        className="bg-background/80"
                    />
                    <Button className="w-full" onClick={handleCreateAlibi} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2" /> Create Alibi</>}
                    </Button>
                </CardContent>
            </Card>
            
            {alibi && (
                <Alert className="bg-background/80">
                    <Calendar className="h-4 w-4" />
                    <AlertTitle className="flex justify-between items-center">
                        <span>Meeting Generated</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(alibi.title)}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </AlertTitle>
                    <AlertDescription className="font-mono text-foreground">
                        {alibi.title}
                    </AlertDescription>
                    {alibi.attendees && alibi.attendees.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground">Attendees:</p>
                            <p className="text-xs text-muted-foreground">{alibi.attendees.join(', ')}</p>
                        </div>
                    )}
                </Alert>
            )}

            <div className="flex-grow"></div>

            {/* MonetizationHook */}
            <div className="mt-auto pt-2 border-t border-border/50">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="plausible-attendees" className="text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Plausible Attendees
                                </Label>
                                <Switch 
                                    id="plausible-attendees" 
                                    checked={addAttendees} 
                                    onCheckedChange={setAddAttendees}
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs max-w-xs">Adds fake external attendees to make the invite look more legitimate. Requires Artisan plan.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
