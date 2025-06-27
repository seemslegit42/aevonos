import { z } from 'zod';

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
