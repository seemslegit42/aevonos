
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias'> | null;

interface TopBarProps {
  user: UserProp;
  workspace: Workspace | null;
}

const CurrentTime = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    // This logic ensures the time is only rendered on the client, avoiding hydration mismatches.
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timerId = setInterval(() => {
        setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000 * 60); // Update every minute
    return () => clearInterval(timerId);
  }, []);

  return <span className="hidden lg:inline">{time}</span>;
}

export default function TopBar({ user, workspace }: TopBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();
  const { handleCommandSubmit, isLoading, upsertApp } = useAppStore();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const command = formData.get('command') as string;
    handleCommandSubmit(command);
    formRef.current?.reset();
  };
  
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

  const displayName = user ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email) : "Operator";
  const roleText = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Operator';
  
  const agentName = user?.agentAlias || 'BEEP';
  const placeholderText = isMobile ? `${agentName} Command...` : `Ask ${agentName} to...`;

  return (
    <header className="flex items-center justify-between w-full px-2 sm:px-4 py-2 bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg rounded-lg gap-2 sm:gap-4">
      <div className="flex items-center gap-3">
        <Link href="/">
            <Image src="/logo-neutral.svg" alt="Aevon OS Logo" width={32} height={32} />
        </Link>
      </div>

      <div className="flex-1 max-w-xl">
        <form ref={formRef} onSubmit={handleSubmit} className="relative w-full">
          <Input
            name="command"
            type="text"
            placeholder={placeholderText}
            className={cn(
              "w-full h-10",
              "focus-visible:ring-1 focus-visible:ring-roman-aqua",
              isLoading && "ring-1 ring-inset ring-roman-aqua animate-pulse"
            )}
            disabled={isLoading}
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-sm text-foreground">
        <div className="hidden md:flex items-center gap-4 text-sm font-lexend">
          <CurrentTime />
          <div className="h-6 w-px bg-border/30" />
           <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-foreground" onClick={handleProfileClick}>
                        <span>{displayName} | {roleText}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Manage Your Profile</p>
                </TooltipContent>
            </Tooltip>
           </TooltipProvider>
           <div className="h-6 w-px bg-border/30" />
           <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-foreground" onClick={handleBillingClick}>
                        <span>
                        Ξ <span className="text-gilded-accent font-bold">{workspace?.credits ? Number(workspace.credits).toFixed(2) : '0.00'}</span>
                        </span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>View Usage & Manage Billing</p>
                </TooltipContent>
            </Tooltip>
           </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
