'use server';
/**
 * @fileOverview Tools for interacting with the CRM.
 * This is not a service. This is a collection of tools for agentic use.
 */
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { 
    CreateContactInputSchema,
    UpdateContactInputSchema,
    DeleteContactInputSchema,
    ContactSchema,
    DeleteContactOutputSchema,
    type CreateContactInput, 
    type Contact, 
    type DeleteContactInput, 
    type DeleteContactOutput, 
    type UpdateContactInput 
} from './crm-schemas';

// Genkit Flows for standardized CRM operations

const createContactFlow = ai.defineFlow(
  {
    name: 'createContactFlow',
    inputSchema: CreateContactInputSchema,
    outputSchema: ContactSchema,
  },
  async (input) => {
    try {
      const contact = await prisma.contact.create({
        data: {
          ...input,
        },
      });
      return contact;
    } catch (error) {
      console.error('[CRM Tool Error] Failed to create contact:', error);
      throw new Error('Failed to create the contact in the database.');
    }
  }
);

const updateContactFlow = ai.defineFlow(
    {
      name: 'updateContactFlow',
      inputSchema: UpdateContactInputSchema,
      outputSchema: ContactSchema,
    },
    async (input) => {
        try {
            const { id, ...dataToUpdate } = input;
            const contact = await prisma.contact.update({
              where: { id },
              data: dataToUpdate,
            });
            return contact;
        } catch (error) {
            console.error(`[CRM Tool Error] Failed to update contact with ID ${input.id}:`, error);
            throw new Error('Failed to update the contact in the database.');
        }
    }
);

const listContactsFlow = ai.defineFlow(
    {
      name: 'listContactsFlow',
      inputSchema: z.void(),
      outputSchema: z.array(ContactSchema),
    },
    async () => {
        try {
            const contacts = await prisma.contact.findMany({
                orderBy: {
                    createdAt: 'desc',
                }
            });
            return contacts;
          } catch (error) {
            console.error('[CRM Tool Error] Failed to list contacts:', error);
            throw new Error('Failed to retrieve contacts from the database.');
          }
    }
);

const deleteContactFlow = ai.defineFlow(
    {
      name: 'deleteContactFlow',
      inputSchema: DeleteContactInputSchema,
      outputSchema: DeleteContactOutputSchema,
    },
    async (input) => {
        try {
            await prisma.contact.delete({
                where: {
                    id: input.id,
                }
            });
            return { id: input.id, success: true };
        } catch (error) {
            console.error(`[CRM Tool Error] Failed to delete contact with ID ${input.id}:`, error);
            return { id: input.id, success: false };
        }
    }
);


// Exported functions that call the Genkit flows.
// This maintains the original contract for the BEEP agent.

export async function createContactInDb(input: CreateContactInput): Promise<Contact> {
    return createContactFlow(input);
}

export async function updateContactInDb(input: UpdateContactInput): Promise<Contact> {
    return updateContactFlow(input);
}

export async function listContactsFromDb(): Promise<Contact[]> {
    return listContactsFlow();
}

export async function deleteContactInDb(input: DeleteContactInput): Promise<DeleteContactOutput> {
    return deleteContactFlow(input);
}
