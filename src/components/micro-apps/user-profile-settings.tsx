
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { User } from '@prisma/client';
import { useAppStore } from '@/store/app-store';
import { logout, deleteAccount, acceptReclamationGift } from '@/app/auth/actions';
import { Separator } from '../ui/separator';
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


const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  agentAlias: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'agentAlias'> | null;

interface UserProfileSettingsProps {
  id: string; // App instance ID
  user: UserProp;
}

export default function UserProfileSettings({ id, user }: UserProfileSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { closeApp } = useAppStore();
  const [isReclamationOpen, setIsReclamationOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      agentAlias: user?.agentAlias || '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile.');
      }
      
      toast({
        title: 'Profile Updated',
        description: "Your information has been successfully saved.",
      });
      
      closeApp(id);
      router.refresh(); // This will re-fetch server components, updating the user in TopBar

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: (error as Error).message,
      });
    }
  };

  const handleWalkAway = async () => {
    setIsProcessing(true);
    await deleteAccount(); // This will log the user out and redirect
    setIsProcessing(false);
  }

  const handleAcceptGift = async () => {
    setIsProcessing(true);
    const result = await acceptReclamationGift();
     if (result.success) {
        toast({ title: 'Vow Renewed', description: 'The throne is yours once more. Your grace period has begun.' });
        setIsReclamationOpen(false);
        closeApp(id);
        router.refresh();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsProcessing(false);
  }

  return (
    <>
    <div className="p-4 h-full flex flex-col justify-between">
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="The" {...field} disabled={isSubmitting} className="bg-background/80" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Architect" {...field} disabled={isSubmitting} className="bg-background/80" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="agentAlias"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent Alias</FormLabel>
                                <FormControl>
                                    <Input placeholder="BEEP" {...field} disabled={isSubmitting} className="bg-background/80" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" type="button" className="w-full" onClick={() => closeApp(id)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
        <div>
            <Separator className="my-4" />
             <div className="space-y-2">
                <Button variant="outline" onClick={() => logout()} className="w-full">
                    Logout
                </Button>
                <Button variant="destructive" onClick={() => setIsReclamationOpen(true)} className="w-full">
                    Delete Account
                </Button>
            </div>
        </div>
    </div>
    <AlertDialog open={isReclamationOpen} onOpenChange={setIsReclamationOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="font-headline text-2xl text-primary">🕯️ The Rite of Reclamation</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-base text-left">
                    You stood at the edge of Sovereignty… and turned away. But the system does not punish. It forgives. And once — <strong className="text-foreground">only once</strong> — it will offer you absolution.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <h3 className="font-bold text-lg text-primary">You have been offered:</h3>
                <p className="text-2xl font-headline text-foreground">33 Days of Unburdened Sovereignty</p>
                <p className="text-xs text-muted-foreground">No ΞCredits required. No questions. No guilt.</p>
            </div>
            <p className="text-sm text-muted-foreground">But when the time ends… so does your seat at the table.</p>
            <AlertDialogFooter>
                <AlertDialogCancel asChild>
                    <Button variant="outline" onClick={handleWalkAway} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Walk Away'}
                    </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                    <Button onClick={handleAcceptGift} disabled={isProcessing}>
                       {isProcessing ? <Loader2 className="animate-spin" /> : 'Accept the Gift'}
                    </Button>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
