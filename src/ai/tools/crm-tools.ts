'use server';
/**
 * @fileOverview Tools for interacting with the CRM.
 * This is not a service. This is a collection of tools for agentic use.
 */
import prisma from '@/lib/prisma';
import type { CreateContactInput, Contact, DeleteContactInput, DeleteContactOutput } from './crm-schemas';

// The schemas and Genkit tool definition were moved/removed to avoid "use server" build errors.
// This file should only export async server functions.

export async function createContactInDb(input: CreateContactInput): Promise<Contact> {
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

export async function listContactsFromDb(): Promise<Contact[]> {
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

export async function deleteContactInDb(input: DeleteContactInput): Promise<DeleteContactOutput> {
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
