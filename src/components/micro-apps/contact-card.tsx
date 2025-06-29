
'use client';

import React from 'react';
import type { Contact } from '@/ai/tools/crm-schemas';
import { useAppStore } from '@/store/app-store';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

export default function ContactCard({ contact }: ContactCardProps) {
  const { handleCommandSubmit, upsertApp } = useAppStore();

  const handleDelete = () => {
    handleCommandSubmit(`delete contact with id ${contact.id}`);
  };
  
  const handleEdit = () => {
    upsertApp('contact-editor', {
      id: `contact-editor-${contact.id}`,
      title: `Edit: ${contact.firstName}`,
      contentProps: { contact },
    });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  return (
    <Card className="bg-foreground/10 backdrop-blur-md border border-foreground/20 hover:border-primary transition-all duration-300 flex flex-col group">
        <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
            <Avatar>
                <AvatarFallback>{getInitials(contact.firstName, contact.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
                <CardTitle className="text-base text-foreground truncate">{contact.firstName} {contact.lastName}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground truncate">{contact.email}</CardDescription>
            </div>
        </CardHeader>
        <CardFooter className="p-2 pt-0 mt-auto flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
                <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
        </CardFooter>
    </Card>
  );
}
