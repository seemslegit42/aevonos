
'use client';

import React from 'react';
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
} from "@/components/ui/form"
import { useAppStore } from '@/store/app-store';
import type { Contact } from '@/ai/tools/crm-schemas';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type ContactFormData = z.infer<typeof formSchema>;

interface ContactEditorProps {
  id: string; // The app instance ID
  contact?: Contact;
}

export default function ContactEditor({ id, contact }: ContactEditorProps) {
  const { handleCommandSubmit, isLoading, closeApp } = useAppStore();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
    },
  });

  const onSubmit = (data: ContactFormData) => {
    let command = '';
    if (contact) {
      // Build update command
      command = `update contact with id ${contact.id} setting `;
      const updates = Object.entries(data)
        .filter(([key, value]) => value !== (contact as any)[key] && value)
        .map(([key, value]) => `${key} to "${value}"`)
        .join(' and ');
      if (!updates) {
          closeApp(id);
          return;
      }
      command += updates;
    } else {
      // Build create command
      command = `create a new contact named ${data.firstName}`;
      if (data.lastName) command += ` ${data.lastName}`;
      if (data.email) command += ` with email ${data.email}`;
      if (data.phone) command += ` and phone ${data.phone}`;
    }
    
    // The submission is fire-and-forget. The app store will reactively
    // close this app instance upon receiving a successful agent report.
    handleCommandSubmit(command);
  };
  
  return (
    <div className="p-2 h-full">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
                <div className="flex-grow space-y-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} className="bg-background/80" />
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
                                    <Input placeholder="Doe" {...field} className="bg-background/80" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="john.doe@aevonos.com" {...field} className="bg-background/80" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="(555) 123-4567" {...field} className="bg-background/80" />
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
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {contact ? 'Save Changes' : 'Create Contact'}
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
