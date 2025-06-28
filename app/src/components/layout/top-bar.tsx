
'use client';

import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sparkles, ShieldCheck, LogOut, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { logout } from '@/app/auth/actions';
import type { User } from '@prisma/client';

type UserProp = Pick<User, 'email' | 'firstName' | 'lastName'> | null;

interface TopBarProps {
  onCommandSubmit: (command: string) => void;
  isLoading: boolean;
  user: UserProp;
}

export default function TopBar({ onCommandSubmit, isLoading, user }: TopBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();

  const getInitials = () => {
    if (!user) return 'A';
    const first = user.firstName ? user.firstName.charAt(0) : '';
    const last = user.lastName ? user.lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || 'A';
  }


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const command = formData.get('command') as string;
    onCommandSubmit(command);
    formRef.current?.reset();
  };

  return (
    <header className="flex items-center justify-between w-full px-2 sm:px-4 py-2 bg-foreground/10 backdrop-blur-xl rounded-lg border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] gap-2 sm:gap-4">
      <div className="flex items-center">
        <h1 className="text-xl font-headline font-bold text-foreground tracking-widest">
          <span className="text-primary">ΛΞ</span>VON
        </h1>
      </div>
      <div className="flex-1 max-w-xl">
        <form ref={formRef} onSubmit={handleSubmit} className="relative">
          <Input
            name="command"
            type="text"
            placeholder={isMobile ? "BEEP Command..." : "BEEP: Tell me what you want to achieve..."}
            className="w-full bg-input/10 border border-foreground/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 pl-10 h-10"
            disabled={isLoading}
          />
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
        </form>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2" title="Aegis Status: Online">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="hidden md:inline">Aegis: Online</span>
        </div>
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
                        <p className="text-sm font-medium leading-none">{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'The Architect'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email || 'architect@aevonos.com'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Workspace Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
