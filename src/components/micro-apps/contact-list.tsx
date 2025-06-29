
'use client';

import React from 'react';
import type { Contact } from '@/ai/tools/crm-schemas';
import ContactCard from './contact-card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

interface ContactListProps {
  contacts?: Contact[];
}

export default function ContactList({ contacts }: ContactListProps) {
  const { upsertApp } = useAppStore();

  if (!contacts) {
    return <p className="text-muted-foreground text-sm p-4 text-center">Loading contacts...</p>;
  }

  const handleNewContact = () => {
    upsertApp('contact-editor', {
        id: 'contact-editor-new',
        title: 'New Contact',
    });
  }

  return (
    <div className="p-1 flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
         <Button variant="outline" className="w-full" onClick={handleNewContact}>
            <UserPlus className="mr-2 h-4 w-4"/>
            New Contact
         </Button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-muted-foreground text-sm p-4 text-center">No contacts found. Click "New Contact" to add one.</p>
      ) : (
        <div className="flex-grow overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
