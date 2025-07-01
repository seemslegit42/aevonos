
'use server';
/**
 * @fileOverview Tools for interacting with the CRM.
 * This is not a service. This is a collection of tools for agentic use.
 */
import prisma from '@/lib/prisma';
import { z } from 'zod';
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
import { authorizeAndDebitAgentActions } from '@/services/billing-service';


export async function createContactInDb(input: CreateContactInput, workspaceId: string, userId: string): Promise<Contact> {
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'TOOL_USE' });
    try {
      const { ...contactData } = input;
      const contact = await prisma.contact.create({
        data: {
          ...contactData,
          workspaceId,
        },
      });
      return contact;
    } catch (error) {
      console.error('[CRM Tool Error] Failed to create contact:', error);
      throw new Error('Failed to create the contact in the database.');
    }
}

export async function updateContactInDb(input: UpdateContactInput, workspaceId: string, userId: string): Promise<Contact> {
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'TOOL_USE' });
    try {
        const { id, ...dataToUpdate } = input;
        // Verify contact belongs to the workspace before updating
        const existingContact = await prisma.contact.findFirst({
            where: { id, workspaceId }
        });
        if (!existingContact) {
            throw new Error(`Contact with ID ${id} not found in this workspace.`);
        }

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

export async function listContactsFromDb(workspaceId: string, userId: string): Promise<Contact[]> {
    // A read operation also counts as an agent action.
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'TOOL_USE' });
    try {
        const contacts = await prisma.contact.findMany({
            where: {
                workspaceId,
            },
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

export async function deleteContactInDb(input: DeleteContactInput, workspaceId: string, userId: string): Promise<DeleteContactOutput> {
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'TOOL_USE' });
    try {
        // Verify contact belongs to the workspace before deleting
        const existingContact = await prisma.contact.findFirst({
            where: { id: input.id, workspaceId: workspaceId }
        });
        if (!existingContact) {
            return { id: input.id, success: false };
        }

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
