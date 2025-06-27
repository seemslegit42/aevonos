
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema from api-spec.md for creating a contact
const ContactCreationRequestSchema = z.object({
  email: z.string().email().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('[API /contacts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve contacts.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = ContactCreationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid contact data.', issues: validation.error.issues }, { status: 400 });
    }

    // Check for existing contact with the same email if provided
    if (validation.data.email) {
      const existingContact = await prisma.contact.findUnique({
        where: { email: validation.data.email },
      });
      if (existingContact) {
        return NextResponse.json({ error: 'Contact with this email already exists.' }, { status: 409 });
      }
    }

    const newContact = await prisma.contact.create({
      data: validation.data,
    });

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('[API /contacts POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create contact.' }, { status: 500 });
  }
}
