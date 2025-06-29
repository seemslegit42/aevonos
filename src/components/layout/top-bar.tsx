
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sparkles, ShieldCheck, LogOut, Settings, User as UserIcon, Database, Gem, Mic, MicOff, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { logout } from '@/app/auth/actions';
import type { User, Workspace } from '@prisma/client';
import { useAppStore } from '@/store/app-store';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import BillingPopoverContent from '@/components/billing-popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'> | null;

interface TopBarProps {
  user: UserProp;
  workspace: Workspace | null;
}

export default function TopBar({ user, workspace }: TopBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);
  const { handleCommandSubmit, isLoading, upsertApp } = useAppStore();
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [pulseNarrative, setPulseNarrative] = useState<string | null>(null);
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchPulseNarrative = async () => {
    if (isNarrativeLoading) return;
    setIsNarrativeLoading(true);
    try {
      const response = await fetch('/api/user/pulse');
      if (!response.ok) return;
      const data = await response.json();
      setPulseNarrative(data.narrative);
    } catch (e) {
      console.error("Failed to fetch pulse narrative", e);
      setPulseNarrative("The threads are silent.");
    } finally {
      setIsNarrativeLoading(false);
    }
  }

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (formRef.current) {
            const inputElement = formRef.current.elements.namedItem('command') as HTMLInputElement;
            if (inputElement) {
                inputElement.value = transcript;
            }
        }
        handleCommandSubmit(transcript);
        setIsListening(false);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({ variant: 'destructive', title: 'Voice Recognition Error', description: `Could not process audio. Error: ${event.error}` });
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    }
  }, [handleCommandSubmit, toast]);

  const getInitials = () => {
    if (!user) return 'A';
    const first = user.firstName ? user.firstName.charAt(0) : '';
    const last = user.lastName ? user.lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || 'A';
  }

  const handleMicClick = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
      } else {
          recognitionRef.current?.start();
          setIsListening(true);
      }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const command = formData.get('command') as string;
    handleCommandSubmit(command);
    formRef.current?.reset();
  };

  const placeholderText = isListening ? "Listening..." : isMobile ? "BEEP Command..." : "BEEP: Tell me what you want to achieve...";
  
  const handleOpenProfileSettings = () => {
    upsertApp('user-profile-settings', { id: 'singleton-user-profile-settings', contentProps: { user } });
  }

  const handleOpenWorkspaceSettings = () => {
      upsertApp('workspace-settings', { id: 'singleton-workspace-settings', contentProps: { workspace } });
  }


  return (
    <header className="flex items-center justify-between w-full px-2 sm:px-4 py-2 bg-foreground/10 backdrop-blur-xl rounded-lg border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] gap-2 sm:gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-headline font-bold text-foreground tracking-widest">
          <span className="text-primary">ΛΞ</span>VON
        </h1>
        {workspace && (
          <>
            <div className="h-6 w-px bg-border hidden md:block" />
            <span className="text-sm font-medium text-muted-foreground hidden md:inline">{workspace.name}</span>
            <Badge variant="secondary" className="hidden lg:inline-flex capitalize">{workspace.planTier}</Badge>
          </>
        )}
      </div>
      <div className="flex-1 max-w-xl">
        <div className="flex items-center gap-2">
            <form ref={formRef} onSubmit={handleSubmit} className="relative flex-1">
              <Input
                name="command"
                type="text"
                placeholder={isMounted ? placeholderText : "BEEP: Tell me what you want to achieve..."}
                className="w-full bg-input/10 border border-foreground/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 pl-10 h-10"
                disabled={isLoading}
              />
              <Sparkles className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70", isListening && "animate-pulse")}/>
            </form>
            {isMobile && isMounted && (
                <Button type="button" size="icon" variant="ghost" onClick={handleMicClick} className={cn("flex-shrink-0 h-10 w-10", isListening && "bg-destructive/20")}>
                    {isListening ? <MicOff className="text-destructive animate-pulse" /> : <Mic className="text-primary"/>}
                </Button>
            )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2" title="Aegis Status: Online">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="hidden md:inline">Aegis: Online</span>
        </div>
        <div className="h-6 w-px bg-border hidden md:block" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1.5 h-8 px-2">
                <Database className="w-4 h-4 text-primary" />
                <span className="hidden md:inline font-medium font-mono">{(workspace?.credits as unknown as number)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <BillingPopoverContent workspace={workspace} />
          </PopoverContent>
        </Popover>
        <DropdownMenu onOpenChange={(open) => {
            if (open) fetchPulseNarrative();
            else setPulseNarrative(null); // Reset on close
          }}>
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
                <div className="px-2 py-1.5 flex items-center justify-end">
                     {user?.role && <Badge variant="secondary" className="capitalize text-xs">{user.role.toLowerCase()}</Badge>}
                </div>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground italic text-center min-h-[1.5rem] flex items-center justify-center">
                    {isNarrativeLoading ? <Loader2 className="h-3 w-3 animate-spin"/> : pulseNarrative}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleOpenProfileSettings(); }} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleOpenWorkspaceSettings(); }} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Workspace Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
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
