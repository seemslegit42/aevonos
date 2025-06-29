
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { logout } from '@/app/auth/actions';
import type { User, Workspace, UserRole } from '@prisma/client';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'> | null;

interface TopBarProps {
  user: UserProp;
  workspace: Workspace | null;
}

const CurrentTime = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const timerId = setInterval(update, 1000 * 60); // Update every minute
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

  const getInitials = () => {
    if (!user) return 'Λ';
    const first = user.firstName ? user.firstName.charAt(0) : '';
    const last = user.lastName ? user.lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || 'Λ';
  };
  
  const handleOpenProfileSettings = () => {
    upsertApp('user-profile-settings', { id: 'singleton-user-profile-settings', contentProps: { user } });
  }

  const handleOpenWorkspaceSettings = () => {
      upsertApp('workspace-settings', { id: 'singleton-workspace-settings', contentProps: { workspace } });
  }

  const roleText = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Operator';
  const sessionText = `${roleText} | Session: `;

  return (
    <header className="flex items-center justify-between w-full px-2 sm:px-4 py-2 bg-[rgba(245,255,250,0.10)] backdrop-blur-[25px] rounded-lg border border-[rgba(245,255,250,0.25)] shadow-[0_4px_24px_0_rgba(28,25,52,0.1)] gap-2 sm:gap-4">
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
            placeholder={isMobile ? "BEEP Command..." : "Ask BEEP to..."}
            className="w-full bg-[rgba(245,255,250,0.2)] text-foreground placeholder:text-muted-foreground border-0 focus-visible:ring-1 focus-visible:ring-primary h-10"
            disabled={isLoading}
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-sm font-code text-foreground">
        <div className="hidden md:flex items-center gap-4 text-sm text-foreground">
          <CurrentTime />
          <div className="h-6 w-px bg-[rgba(245,255,250,0.25)]" />
          <span>
            {sessionText}
            <span className="text-gilded-accent font-bold">Active</span>
          </span>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarFallback className="bg-transparent text-sm">{getInitials()}</AvatarFallback>
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
                <DropdownMenuItem onSelect={handleOpenProfileSettings} className="cursor-pointer">
                    Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleOpenWorkspaceSettings} className="cursor-pointer">
                    Workspace Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:bg-destructive/20 focus:text-destructive">
                      Log out
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to terminate the session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. You will be logged out and returned to the identity verification gateway.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Remain Connected</AlertDialogCancel>
                      <AlertDialogAction onClick={() => logout()} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Terminate Session</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
