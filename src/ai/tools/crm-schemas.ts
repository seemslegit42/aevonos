import { z } from 'zod';

export const CreateContactInputSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});
export type CreateContactInput = z.infer<typeof CreateContactInputSchema>;

export const DeleteContactInputSchema = z.object({
  id: z.string().describe('The CUID of the contact to delete.'),
});
export type DeleteContactInput = z.infer<typeof DeleteContactInputSchema>;

export const DeleteContactOutputSchema = z.object({
  id: z.string(),
  success: z.boolean(),
});
export type DeleteContactOutput = z.infer<typeof DeleteContactOutputSchema>;

export const ContactSchema = z.object({
    id: z.string(),
    email: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    phone: z.string().nullable(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()),
});
export type Contact = z.infer<typeof ContactSchema>;
