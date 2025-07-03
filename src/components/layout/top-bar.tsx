
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-is-mobile';
import type { User, Workspace } from '@prisma/client';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Command, Mic } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { handleLogout } from '@/app/auth/actions';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias'> | null;

interface TopBarProps {
  user: UserProp;
  workspace: Workspace | null;
}

const CurrentTime = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    // This logic ensures the time is only rendered on the client, avoiding hydration mismatches.
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const timerId = setInterval(update, 1000 * 60); // Update every minute
    return () => clearInterval(timerId);
  }, []);

  return <span className="hidden lg:inline">{time}</span>;
}

export default function TopBar({ user, workspace }: TopBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();
  const { handleCommandSubmit, isLoading, beepOutput, upsertApp } = useAppStore();
  const [inputValue, setInputValue] = useState('');

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
  
  const handleProfileClick = () => {
    if (user) {
        upsertApp('user-profile-settings', {
            id: 'singleton-user-profile',
            title: `Profile: ${user.firstName || user.email}`,
            contentProps: { user }
        });
    }
  };
  
  const handleBillingClick = () => {
      upsertApp('usage-monitor', { 
          id: 'singleton-usage-monitor',
          contentProps: { workspace, user }
      });
  }

  const agentName = user?.agentAlias || 'BEEP';
  const placeholderText = isMobile ? `${agentName} Command...` : `Ask ${agentName} to...`;
  const displayName = user ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email) : "Operator";
  const roleText = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Operator';
  const getInitials = () => {
    const first = user?.firstName ? user.firstName.charAt(0) : '';
    const last = user?.lastName ? user.lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || (user?.email ? user.email.charAt(0).toUpperCase() : '');
  }

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
        <div className="hidden md:flex items-center gap-4 text-sm font-lexend">
          <CurrentTime />
          <div className="h-6 w-px bg-border/30" />
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-foreground" onClick={handleProfileClick}>
            <span>{displayName} | {roleText}</span>
          </Button>
           <div className="h-6 w-px bg-border/30" />
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-foreground" onClick={handleBillingClick}>
            <span>
              Ξ <span className="text-gilded-accent font-bold">{workspace?.credits ? Number(workspace.credits).toFixed(2) : '0.00'}</span>
            </span>
          </Button>
        </div>
        <div className="flex md:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={handleProfileClick}>
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBillingClick}>
                        Billing & Usage
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => handleLogout()}>
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
