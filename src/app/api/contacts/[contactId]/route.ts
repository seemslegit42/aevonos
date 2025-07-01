
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerActionSession } from '@/lib/auth';

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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getServerActionSession();
    const { contactId } = params;
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, workspaceId: sessionUser.workspaceId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /contacts/{contactId} GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve contact.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getServerActionSession();
    const { contactId } = params;
    const body = await request.json();
    const validation = ContactUpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid contact data.', issues: validation.error.issues }, { status: 400 });
    }

    // Verify the contact belongs to the user's workspace before updating
    const existingContact = await prisma.contact.findFirst({
        where: { id: contactId, workspaceId: sessionUser.workspaceId }
    });
    if (!existingContact) {
        return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: validation.data,
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error(`[API /contacts/{contactId} PUT]`, error);
    return NextResponse.json({ error: 'Failed to update contact.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const sessionUser = await getServerActionSession();
        const { contactId } = params;

        // Verify the contact belongs to the user's workspace before deleting
        const existingContact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId: sessionUser.workspaceId }
        });
        if (!existingContact) {
            return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
        }

        await prisma.contact.delete({
            where: { id: contactId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error(`[API /contacts/{contactId} DELETE]`, error);
        return NextResponse.json({ error: 'Failed to delete contact.' }, { status: 500 });
    }
}
