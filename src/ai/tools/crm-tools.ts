'use server';
/**
 * @fileOverview Tools for interacting with the CRM.
 * This is not a service. This is a collection of tools for agentic use.
 */
import prisma from '@/lib/prisma';
import type { CreateContactInput, Contact } from './crm-schemas';

// The schemas and Genkit tool definition were moved/removed to avoid "use server" build errors.
// This file should only export async server functions.

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
