
'use client';

import React, { useState, useTransition } from 'react';
import { User, UserPsyche, UserRole } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, Loader2, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole, removeUserFromWorkspace } from '@/app/admin/actions';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt' | 'psyche' | 'agentAlias'>;

interface UserCardProps {
    user: UserData;
    currentUserId: string;
    onActionComplete: () => void;
}

const psycheConfig = {
    [UserPsyche.ZEN_ARCHITECT]: { symbol: '🜄', name: 'Covenant of Silence', color: 'text-cyan-400' },
    [UserPsyche.SYNDICATE_ENFORCER]: { symbol: '🜁', name: 'Covenant of Motion', color: 'text-amber-400' },
    [UserPsyche.RISK_AVERSE_ARTISAN]: { symbol: '🜃', name: 'Covenant of Worship', color: 'text-green-400' },
};


export default function UserCard({ user, currentUserId, onActionComplete }: UserCardProps) {
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
    const [isRemoveUserOpen, setIsRemoveUserOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || '?';
    };

    const handleUpdateRole = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateUserRole(formData);
            if (result.success) {
                toast({ title: "Decree Enacted", description: result.message });
                setIsEditRoleOpen(false);
            } else {
                toast({ variant: 'destructive', title: "Decree Failed", description: result.error });
            }
            onActionComplete();
        });
    };

    const handleRemoveUser = async () => {
        const formData = new FormData();
        formData.append('userId', user.id);
        startTransition(async () => {
            const result = await removeUserFromWorkspace(formData);
            if (result.success) {
                toast({ title: "Soul Exiled", description: result.message });
                setIsRemoveUserOpen(false);
            } else {
                toast({ variant: 'destructive', title: "Exile Failed", description: result.error });
            }
            onActionComplete();
        });
    };

    const isCurrentUser = user.id === currentUserId;
    const covenant = psycheConfig[user.psyche];

    return (
        <>
            <Card className="bg-background/50 flex flex-col">
                <CardHeader className="flex flex-row items-start gap-4 p-4">
                    <Avatar>
                        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <CardTitle className="text-base">{user.firstName} {user.lastName}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                        <Badge variant={user.role === UserRole.ADMIN ? 'destructive' : 'secondary'} className="mt-2">{user.role}</Badge>
                    </div>
                    {!isCurrentUser && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Architect's Decrees</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => setIsEditRoleOpen(true)}><Edit className="mr-2" />Bestow Rank</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => setIsRemoveUserOpen(true)} className="text-destructive"><Trash2 className="mr-2" />Exile Soul</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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

            {/* Dialogs */}
            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bestow Rank upon {user.email}</DialogTitle>
                        <DialogDescription>Change the soul's permissions within the Pantheon.</DialogDescription>
                    </DialogHeader>
                    <form action={handleUpdateRole}>
                        <input type="hidden" name="userId" value={user.id} />
                        <Select name="role" defaultValue={user.role}>
                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                {Object.values(UserRole).map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <DialogFooter className="mt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 animate-spin"/>}Enact Decree</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isRemoveUserOpen} onOpenChange={setIsRemoveUserOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Exile Soul from Pantheon?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently exile <strong className="text-foreground">{user.email}</strong> from the workspace. They will lose all access. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveUser} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
                            {isPending ? <Loader2 className="animate-spin" /> : 'Exile Soul'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
