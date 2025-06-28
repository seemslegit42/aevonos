'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, Star, ThumbsDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DrSyntaxInput, DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { useAppStore } from '@/store/app-store';

export default function DrSyntax(props: DrSyntaxOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading
    }));
    const [content, setContent] = useState('');
    const [contentType, setContentType] = useState<DrSyntaxInput['contentType']>('prompt');
    const [result, setResult] = useState<DrSyntaxOutput | null>(props && 'critique' in props ? props : null);
    const { toast } = useToast();

    useEffect(() => {
        if (props && 'critique' in props) {
            setResult(props);
        }
    }, [props]);

    const handleCritique = async () => {
        if (!content) {
            toast({ variant: "destructive", title: "Dr. Syntax is unimpressed.", description: "Provide some content worth my time." });
            return;
        }
        const command = `critique this ${contentType}: "${content}"`;
        handleCommandSubmit(command);
    };

    const ratingColor = result ? (result.rating < 4 ? 'text-destructive' : result.rating < 7 ? 'text-yellow-400' : 'text-accent') : '';

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <Card className="bg-background/50 border-0 shadow-none p-0">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Dr. Syntax: The Critic</CardTitle>
                    <CardDescription className="text-xs">Submit your mediocrity for judgment.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Paste your prompt, code, or copy here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isLoading}
                        rows={5}
                    />
                    <div className="flex gap-2">
                        <Select value={contentType} onValueChange={(v: any) => setContentType(v)} disabled={isLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Content Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="prompt">Prompt</SelectItem>
                                <SelectItem value="code">Code</SelectItem>
                                <SelectItem value="copy">Copy</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="w-full" onClick={handleCritique} disabled={isLoading || !content}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2"/>Critique It</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <Card className="bg-background/50 border-border/50 flex-grow">
                     <CardHeader className="p-2">
                        <CardTitle className="text-base flex justify-between items-center">
                            <span>The Verdict</span>
                             <span className={`flex items-center gap-1 font-bold text-lg ${ratingColor}`}>
                                {result.rating}/10 <Star className="w-5 h-5" fill="currentColor" />
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2 text-sm">
                        <Alert className="border-destructive/50 bg-background/50">
                            <ThumbsDown className="h-4 w-4 text-destructive" />
                            <AlertTitle className="text-destructive">Critique</AlertTitle>
                            <AlertDescription className="text-foreground/90 italic">
                                {result.critique}
                            </AlertDescription>
                        </Alert>
                        <Separator />
                        <Alert className="border-accent/50 bg-background/50">
                            <Wand2 className="h-4 w-4 text-accent" />
                            <AlertTitle className="text-accent">Suggestion</AlertTitle>
                            <AlertDescription className="text-foreground/90 italic">
                                {result.suggestion}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
