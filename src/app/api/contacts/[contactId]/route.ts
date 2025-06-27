
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const ContactUpdateRequestSchema = z.object({
  email: z.string().email().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

interface RouteParams {
  params: {
    contactId: string;
  };
}

// GET /api/contacts/{contactId}
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { contactId } = params;
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error(`[API /contacts/{contactId} GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve contact.' }, { status: 500 });
  }
}

// PUT /api/contacts/{contactId}
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { contactId } = params;
    const body = await request.json();
    const validation = ContactUpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid contact data.', issues: validation.error.issues }, { status: 400 });
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: validation.data,
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    // Check for Prisma's specific "record not found" error
    if ((error as any).code === 'P2025') {
         return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
    }
    console.error(`[API /contacts/{contactId} PUT]`, error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update contact.' }, { status: 500 });
  }
}


// DELETE /api/contacts/{contactId}
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { contactId } = params;

        await prisma.contact.delete({
            where: { id: contactId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if ((error as any).code === 'P2025') {
            return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
        }
        console.error(`[API /contacts/{contactId} DELETE]`, error);
        return NextResponse.json({ error: 'Failed to delete contact.' }, { status: 500 });
    }
}
