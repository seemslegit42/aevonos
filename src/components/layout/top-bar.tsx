
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-is-mobile';
import type { User, Workspace } from '@prisma/client';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { getUserVas } from '@/app/user/actions';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Command, Mic } from 'lucide-react';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias'> | null;

interface TopBarProps {
  user: UserProp;
  workspace: Workspace | null;
}

export default function TopBar({ user, workspace }: TopBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();
  const { handleCommandSubmit, isLoading, beepOutput } = useAppStore();
  const [vas, setVas] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
      if (user) {
          getUserVas().then(setVas).catch(err => console.error("Failed to fetch VAS", err));
      }
  }, [user]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    handleCommandSubmit(inputValue);
    setInputValue('');
  };
  
  const handleSuggestionClick = (command: string) => {
    handleCommandSubmit(command);
    setInputValue('');
  }

  const agentName = user?.agentAlias || 'BEEP';
  const placeholderText = isMobile ? `${agentName} Command...` : `Ask ${agentName} to...`;

  return (
    <header className="flex items-center justify-between w-full px-2 sm:px-4 py-2 bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg rounded-lg gap-2 sm:gap-4">
      <div className="flex items-center gap-3">
        <Link href="/">
            <Image src="/logo.png" alt="Aevon OS Logo" width={32} height={32} />
        </Link>
      </div>

      <div className="flex-1 max-w-xl">
         <Popover open={!!beepOutput?.suggestedCommands && beepOutput.suggestedCommands.length > 0 && !!inputValue}>
          <PopoverAnchor asChild>
            <form ref={formRef} onSubmit={handleSubmit} className="relative w-full group">
              <Command className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                name="command"
                type="text"
                placeholder={placeholderText}
                autoComplete="off"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={cn(
                  "w-full bg-background/80 text-foreground placeholder:text-muted-foreground border-border/50 h-10 pl-10 pr-10",
                  "focus-visible:ring-1 focus-visible:ring-roman-aqua",
                  isLoading && "ring-1 ring-inset ring-roman-aqua animate-pulse"
                )}
                disabled={isLoading}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors hover:text-primary" aria-label="Use microphone">
                <Mic />
              </button>
            </form>
          </PopoverAnchor>
          <PopoverContent className="p-1 w-[--radix-popover-trigger-width]">
            <p className="p-2 text-xs text-muted-foreground">Suggestions</p>
            {beepOutput?.suggestedCommands?.map((cmd, i) => (
              <Button
                key={i}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSuggestionClick(cmd)}
              >
                {cmd}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-sm text-foreground">
        <UserNav user={user} workspace={workspace} vas={vas} />
      </div>
    </header>
  );
}
