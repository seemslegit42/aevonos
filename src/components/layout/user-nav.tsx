
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
} from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/store/app-store";
import type { User, Workspace } from "@prisma/client";
import { handleLogout } from "@/app/actions";

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias'> | null;

interface UserNavProps {
  user: UserProp;
  workspace: Workspace | null;
  children?: React.ReactNode;
}

export function UserNav({ user, workspace, children }: UserNavProps) {
    const { upsertApp } = useAppStore();

    if (!user) {
        return null;
    }
    
    const getInitials = () => {
        const first = user?.firstName ? user.firstName.charAt(0) : '';
        const last = user?.lastName ? user.lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || user.email.charAt(0).toUpperCase();
    }
    
    const handleProfileClick = () => {
        upsertApp('user-profile-settings', {
            id: 'singleton-user-profile',
            title: `Profile: ${user.firstName || user.email}`,
            contentProps: { user }
        });
    };
    
    const handleBillingClick = () => {
        upsertApp('usage-monitor', { 
            id: 'singleton-usage-monitor',
            contentProps: { workspace, user }
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
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
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
    )
}
