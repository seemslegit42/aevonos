'use server';
/**
 * @fileOverview Tools for interacting with the CRM.
 * This is not a service. This is a collection of tools for agentic use.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const CreateContactInputSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});
export type CreateContactInput = z.infer<typeof CreateContactInputSchema>;

export const ContactSchema = z.object({
    id: z.string(),
    email: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    phone: z.string().nullable(),
});
export type Contact = z.infer<typeof ContactSchema>;


export async function createContactInDb(input: CreateContactInput): Promise<Contact> {
  try {
    const contact = await prisma.contact.create({
      data: {
        ...input,
      },
    });
    return {
      id: contact.id,
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
    };
  } catch (error) {
    console.error('[CRM Tool Error] Failed to create contact:', error);
    throw new Error('Failed to create the contact in the database.');
  }
}


export const createContactTool = ai.defineTool(
  {
    name: 'createContact',
    description: 'Creates a new contact in the system. Use this when the user asks to "add a contact", "new contact", etc. All properties are optional, but at least one should be provided.',
    inputSchema: CreateContactInputSchema,
    outputSchema: ContactSchema,
  },
  createContactInDb
);
