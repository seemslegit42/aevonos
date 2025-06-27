
'use client';

import React from 'react';
import type { Contact } from '@/ai/tools/crm-schemas';
import ContactCard from './contact-card';

interface ContactListProps {
  contacts: Contact[];
}

export default function ContactList({ contacts }: ContactListProps) {

  if (!contacts || contacts.length === 0) {
    return <p className="text-muted-foreground text-sm p-4 text-center">No contacts found. Try creating one by saying "add new contact".</p>;
  }

  return (
    <div className="max-h-96 overflow-y-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
}
