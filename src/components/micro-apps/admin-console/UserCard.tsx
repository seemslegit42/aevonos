
'use client';

import React from 'react';
import { User, UserPsyche } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import UserActions from './UserActions';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt' | 'psyche' | 'agentAlias'>;

interface UserCardProps {
    user: UserData;
    currentUserId: string;
    onActionComplete: () => void;
}

const psycheConfig = {
    [UserPsyche.ZEN_ARCHITECT]: { symbol: '🜄', name: 'Silence', color: 'text-cyan-400' },
    [UserPsyche.SYNDICATE_ENFORCER]: { symbol: '🜁', name: 'Motion', color: 'text-amber-400' },
    [UserPsyche.RISK_AVERSE_ARTISAN]: { symbol: '🜃', name: 'Worship', color: 'text-green-400' },
};


export default function UserCard({ user, currentUserId, onActionComplete }: UserCardProps) {
    const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || '?';
    };

    const isCurrentUser = user.id === currentUserId;
    const covenant = psycheConfig[user.psyche];

    return (
        <Card className="bg-background/50 flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 p-4">
                <Avatar><AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback></Avatar>
                <div className="flex-grow">
                    <CardTitle className="text-base">{user.firstName || ''} {user.lastName || ''}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'} className="mt-2">{user.role}</Badge>
                </div>
                {!isCurrentUser && (
                    <UserActions user={user} onActionComplete={onActionComplete} />
                )}
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> Agent Alias: <span className="font-semibold text-foreground">{user.agentAlias}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${covenant.color}`}>{covenant.symbol}</span> {covenant.name}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto text-xs text-muted-foreground">
                Last active: {user.lastLoginAt ? `${formatDistanceToNow(new Date(user.lastLoginAt))} ago` : 'Never'}
            </CardFooter>
        </Card>
    );
}
