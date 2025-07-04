'use client';

import React from 'react';
import { User, UserPsyche } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import UserActions from './UserActions';
import { formatDistanceToNow } from 'date-fns';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt' | 'psyche' | 'agentAlias'>;

interface UserRosterTableProps {
    users: UserData[];
    currentUserId: string;
    onActionComplete: () => void;
}

const psycheConfig = {
    [UserPsyche.ZEN_ARCHITECT]: { name: 'Silence', color: 'border-cyan-400/50 text-cyan-400' },
    [UserPsyche.SYNDICATE_ENFORCER]: { name: 'Motion', color: 'border-amber-400/50 text-amber-400' },
    [UserPsyche.RISK_AVERSE_ARTISAN]: { name: 'Worship', color: 'border-green-400/50 text-green-400' },
};

export default function UserRosterTable({ users, currentUserId, onActionComplete }: UserRosterTableProps) {
    const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || '?';
    };

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="hidden lg:table-cell">Covenant</TableHead>
                        <TableHead className="hidden md:table-cell">Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => {
                        const covenant = psycheConfig[user.psyche];
                        return (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="hidden sm:flex"><AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="font-medium truncate">{user.firstName || ''} {user.lastName || ''}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <Badge variant="outline" className={covenant.color}>{covenant.name}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                    {user.lastLoginAt ? `${formatDistanceToNow(new Date(user.lastLoginAt))} ago` : 'Never'}
                                </TableCell>
                                <TableCell className="text-right">
                                    {user.id !== currentUserId && <UserActions user={user} onActionComplete={onActionComplete} />}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
