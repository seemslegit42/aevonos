
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserPlus, Edit, Trash2, Loader2, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { User, UserRole } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole, removeUserFromWorkspace } from '@/app/admin/actions';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt'>;

export default function UserManagementTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isRemoveUserOpen, setIsRemoveUserOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('You do not have permission to view users.');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleUpdateRole = async (formData: FormData) => {
      startTransition(async () => {
          const result = await updateUserRole(formData);
          if (result.success) {
              toast({ title: "Success", description: result.message });
              setUsers(users.map(u => u.id === selectedUser?.id ? {...u, role: formData.get('role') as UserRole} : u));
              setIsEditRoleOpen(false);
          } else {
              toast({ variant: 'destructive', title: "Error", description: result.error });
          }
      });
  };
  
  const handleRemoveUser = async () => {
      if (!selectedUser) return;
      const formData = new FormData();
      formData.append('userId', selectedUser.id);
      
      startTransition(async () => {
          const result = await removeUserFromWorkspace(formData);
          if (result.success) {
              toast({ title: "Success", description: result.message });
              setUsers(users.filter(u => u.id !== selectedUser.id));
              setIsRemoveUserOpen(false);
          } else {
              toast({ variant: 'destructive', title: "Error", description: result.error });
          }
      });
  };

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ));
    }

    if (error) {
        return <TableRow><TableCell colSpan={4} className="text-center text-destructive">{error}</TableCell></TableRow>;
    }

    return users.map(user => (
      <TableRow key={user.id}>
        <TableCell>
          <div className="font-medium">{user.firstName} {user.lastName}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </TableCell>
        <TableCell>
            <Badge variant={user.role === UserRole.ADMIN ? 'destructive' : 'secondary'}>{user.role}</Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
          {user.lastLoginAt ? `${formatDistanceToNow(new Date(user.lastLoginAt))} ago` : 'Never'}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => { setSelectedUser(user); setIsEditRoleOpen(true); }}><Edit className="mr-2"/>Edit Role</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { setSelectedUser(user); setIsRemoveUserOpen(true); }} className="text-destructive"><Trash2 className="mr-2"/>Remove User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <div className="p-2">
      <div className="flex justify-end mb-4">
        <Button disabled><UserPlus className="mr-2" />Invite User</Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableBody()}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Role for {selectedUser?.email}</DialogTitle>
                <DialogDescription>Change the user's permissions within the workspace.</DialogDescription>
            </DialogHeader>
            <form action={handleUpdateRole}>
                <input type="hidden" name="userId" value={selectedUser?.id} />
                <Select name="role" defaultValue={selectedUser?.role}>
                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent>
                        {Object.values(UserRole).map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <DialogFooter className="mt-4">
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 animate-spin"/>}Save Changes</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
      {/* Remove User Alert */}
      <AlertDialog open={isRemoveUserOpen} onOpenChange={setIsRemoveUserOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently remove <strong className="text-foreground">{selectedUser?.email}</strong> from the workspace. They will lose all access. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveUser} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : 'Remove User'}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
