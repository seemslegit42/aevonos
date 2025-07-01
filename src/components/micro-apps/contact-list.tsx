
'use client';

import React from 'react';
import type { Contact } from '@/ai/tools/crm-schemas';
import ContactCard from './contact-card';
import { Button } from '@/components/ui/button';
import { UserPlus, AlertTriangle, Users } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ContactListProps {
  contacts?: Contact[];
  error?: string;
}

function ContactListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

function CardSkeleton() {
    return (
        <div className="p-4 rounded-lg border border-foreground/20 bg-foreground/10 flex flex-col gap-3">
             <div className="flex flex-row items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
             <div className="flex justify-end gap-1 mt-auto">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
             </div>
        </div>
    )
}

export default function ContactList({ contacts, error }: ContactListProps) {
  const { upsertApp } = useAppStore();

  const handleNewContact = () => {
    upsertApp('contact-editor', {
        id: 'contact-editor-new',
        title: 'New Contact',
    });
  }
  
  const renderContent = () => {
      if (!contacts && !error) { // Loading state
          return <ContactListSkeleton />;
      }
      
      if (error) {
          return (
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          );
      }
      
      if (contacts && contacts.length === 0) {
          return (
              <div className="text-center py-10">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">No Contacts Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Your Rolodex is empty. Add a new contact to begin.</p>
              </div>
          )
      }

      return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {contacts?.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
              ))}
          </div>
      );
  }

  return (
    <div className="p-1 flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
         <Button variant="outline" className="w-full" onClick={handleNewContact}>
            <UserPlus className="mr-2 h-4 w-4"/>
            New Contact
         </Button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
