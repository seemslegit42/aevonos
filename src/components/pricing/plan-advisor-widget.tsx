
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askSoothsayer } from '@/ai/agents/plan-advisor';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { OracleIcon } from '../icons/OracleIcon';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export default function PlanAdvisorWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setTimeout(() => {
                 setMessages([{ role: 'ai', content: "The threads of fate shimmer before me. Ask, and I shall reveal the path that awaits you." }]);
            }, 500);
        }
    }, [isOpen, messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await askSoothsayer({ question: input });
            const aiMessage: Message = { role: 'ai', content: response.prophecy };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'A Disturbance in the Aether',
                description: 'The Soothsayer is currently unavailable. The threads are tangled.',
            });
            const errorMessage: Message = { role: 'ai', content: "The aether churns... I cannot see clearly. Ask again when the currents have calmed." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="default"
                    className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg z-50 text-primary-foreground bg-primary hover:bg-primary/90"
                >
                    <OracleIcon className="h-8 w-8" />
                    <span className="sr-only">Consult the Soothsayer</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-80 p-0 border-0 shadow-2xl mr-2 mb-2">
                <div className="flex flex-col h-[28rem] bg-background rounded-lg border">
                    <header className="p-4 border-b">
                        <h3 className="font-semibold text-center font-headline text-primary">The Soothsayer</h3>
                    </header>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4" ref={scrollAreaRef}>
                            <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className={cn(
                                        "flex items-start gap-3 text-sm",
                                        message.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {message.role === 'ai' && <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />}
                                    <div className={cn(
                                        "p-3 rounded-lg max-w-xs",
                                        message.role === 'user' ? 'bg-muted' : 'bg-primary/10'
                                    )}>
                                        <p className={message.role === 'ai' ? 'italic' : ''}>{message.content}</p>
                                    </div>
                                    {message.role === 'user' && <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />}
                                </motion.div>
                            ))}
                            </AnimatePresence>
                             {isLoading && (
                                <div className="flex items-start gap-3 text-sm justify-start">
                                    <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                    <div className="p-3 rounded-lg bg-primary/10">
                                         <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <footer className="p-3 border-t">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Whisper your query..."
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </footer>
                </div>
            </PopoverContent>
        </Popover>
    );
}
