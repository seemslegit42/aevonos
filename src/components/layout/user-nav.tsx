
'use client';

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/store/app-store";
import type { User, Workspace, UserRole } from "@prisma/client";
import { handleLogout } from "@/app/auth/actions";
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Crown, BadgePercent } from "lucide-react";

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias'> | null;

interface UserNavProps {
  user: UserProp;
  workspace: Workspace | null;
  vas: number | null;
  children?: React.ReactNode;
}

export function UserNav({ user, workspace, vas, children }: UserNavProps) {
    const { upsertApp } = useAppStore();
    const { user: firebaseUser } = useAuth();

    if (!user || !firebaseUser) {
        return null;
    }
    
    const getInitials = () => {
        const first = user?.firstName ? user.firstName.charAt(0) : '';
        const last = user?.lastName ? user.lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || (user.email ? user.email.charAt(0).toUpperCase() : '');
    }
    
    const handleProfileClick = () => {
        upsertApp('user-profile-settings', {
            id: 'singleton-user-profile',
            title: `Profile: ${user.firstName || user.email}`,
            contentProps: { user }
        });
    };
    
    const handleBillingClick = () => {
        if (!workspace) return;
        upsertApp('usage-monitor', { 
            id: 'singleton-usage-monitor',
            contentProps: { workspace, user }
        });
    }

    const handleAdminClick = () => {
        upsertApp('admin-console', {
            id: 'singleton-admin-console',
            title: 'Admin Console'
        });
    }

    const trigger = children ?? (
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
        </Button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Workspace</DropdownMenuLabel>
                    <DropdownMenuItem disabled>
                         <div className="flex justify-between w-full">
                            <span>ΞCredit Balance</span>
                            <span className="font-mono text-gilded-accent font-bold">{workspace?.credits ? Number(workspace.credits).toFixed(2) : '0.00'}</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex justify-between w-full">
                                        <span>Vow Alignment Score</span>
                                        <span className="font-mono text-primary font-bold">{vas ?? '...'}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-xs">
                                     <p className="font-bold">Vow Alignment Score</p>
                                     <p className="text-xs">A measure of how closely your actions align with your chosen Covenant, rewarding thematic consistency.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleProfileClick}>
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBillingClick}>
                        Billing & Usage
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' && (
                        <DropdownMenuItem onClick={handleAdminClick}>
                            <Crown className="mr-2 h-4 w-4 text-primary" />
                            Admin Console
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout()}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
