'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Contact } from '@/ai/tools/crm-schemas';
import { useAppStore } from '@/store/app-store';

interface ContactListProps {
  contacts: Contact[];
}

export default function ContactList({ contacts }: ContactListProps) {
  const { handleCommandSubmit } = useAppStore();

  if (!contacts || contacts.length === 0) {
    return <p className="text-muted-foreground text-sm p-4 text-center">No contacts found. Try creating one by saying "add new contact".</p>;
  }

  const handleDelete = (id: string) => {
    handleCommandSubmit(`delete contact with id ${id}`);
  };

  return (
    <div className="max-h-64 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.firstName} {contact.lastName}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
