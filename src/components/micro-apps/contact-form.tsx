
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

interface ContactFormProps {
  contact?: Contact;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ContactForm({ contact, isOpen, onOpenChange }: ContactFormProps) {
  const { handleCommandSubmit, isLoading } = useAppStore();

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
          onOpenChange(false);
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
    handleCommandSubmit(command);
    onOpenChange(false); // Close dialog after submit
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) form.reset();
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Create New Contact'}</DialogTitle>
          <DialogDescription>
            {contact ? `Editing details for ${contact.firstName}.` : 'Add a new contact to your list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
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
                                <Input placeholder="Doe" {...field} />
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
                                <Input placeholder="john.doe@example.com" {...field} />
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
                                <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {contact ? 'Save Changes' : 'Create Contact'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
