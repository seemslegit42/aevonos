
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type Line = {
    type: 'command' | 'response' | 'error';
    content: string;
};

export default function Terminal() {
    const { handleCommandSubmit, isLoading, beepOutput } = useAppStore();
    const [lines, setLines] = useState<Line[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (beepOutput) {
            let responseContent = beepOutput.responseText;
            if (beepOutput.agentReports && beepOutput.agentReports.length > 0) {
                responseContent += '\n\n--- Agent Reports ---\n';
                responseContent += JSON.stringify(beepOutput.agentReports, null, 2);
            }
            setLines(prev => [...prev, { type: 'response', content: responseContent }]);
        }
    }, [beepOutput]);

    useEffect(() => {
        if(scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [lines]);

    const onCommandSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const command = inputRef.current?.value;
        if (!command || isLoading) return;

        const lowerCaseCommand = command.toLowerCase().trim();

        if (lowerCaseCommand === 'clear') {
            setLines([]);
        } else if (lowerCaseCommand === 'help') {
            setLines(prev => [
                ...prev,
                { type: 'command', content: command },
                { type: 'response', content: 'Available local commands:\n  clear - Clears the terminal screen.\n  help  - Shows this help message.\n\nAll other commands are sent to BEEP.' }
            ]);
        } else {
            setLines(prev => [...prev, { type: 'command', content: command }]);
            handleCommandSubmit(command);
        }

        setHistory(prev => [command, ...prev]);
        setHistoryIndex(-1);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.min(historyIndex + 1, history.length - 1);
            if(newIndex >= 0) {
                setHistoryIndex(newIndex);
                if (inputRef.current) inputRef.current.value = history[newIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.max(historyIndex - 1, -1);
            setHistoryIndex(newIndex);
            if(inputRef.current) inputRef.current.value = newIndex >= 0 ? history[newIndex] : '';
        }
    };

    return (
        <div 
            className="h-full w-full bg-black/80 text-white font-mono flex flex-col p-2"
            onClick={() => inputRef.current?.focus()}
        >
            <ScrollArea className="flex-grow">
                <div ref={scrollAreaRef} className="p-2">
                    <pre className="text-xs whitespace-pre-wrap">
                        ΛΞVON OS Terminal v1.0. Welcome, Architect.
                    </pre>
                    {lines.map((line, index) => (
                        <div key={index} className="flex">
                            {line.type === 'command' && <span className="text-cyan-400 mr-2 flex-shrink-0">&gt;</span>}
                            <pre className={cn("text-xs whitespace-pre-wrap", line.type === 'error' && 'text-red-400')}>
                                {line.content}
                            </pre>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="flex-shrink-0">
                <form onSubmit={onCommandSubmit} className="flex items-center">
                    <span className="text-cyan-400 mr-2">&gt;</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="bg-transparent w-full focus:outline-none"
                        autoFocus
                        disabled={isLoading}
                        onKeyDown={handleKeyDown}
                    />
                     {isLoading && <Loader2 className="animate-spin h-4 w-4 ml-2" />}
                </form>
            </div>
        </div>
    );
}
