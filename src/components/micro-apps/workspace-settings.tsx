
'use client';

import React from 'react';
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
import type { Workspace } from '@prisma/client';
import { useAppStore } from '@/store/app-store';

const workspaceFormSchema = z.object({
  name: z.string().min(1, 'Workspace name cannot be empty.'),
});

type WorkspaceFormData = z.infer<typeof workspaceFormSchema>;

interface WorkspaceSettingsProps {
  id: string; // App instance ID
  workspace: Workspace | null;
}

export default function WorkspaceSettings({ id, workspace }: WorkspaceSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { closeApp } = useAppStore();

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: workspace?.name || '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: WorkspaceFormData) => {
    try {
      const response = await fetch('/api/workspaces/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update workspace.');
      }
      
      toast({
        title: 'Workspace Updated',
        description: "Your workspace settings have been saved.",
      });
      
      closeApp(id);
      router.refresh();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className="p-4 h-full">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
                <div className="flex-grow space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Workspace Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Primary Canvas" {...field} disabled={isSubmitting} className="bg-background/80" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="flex-shrink-0 flex gap-2">
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
  );
}

    