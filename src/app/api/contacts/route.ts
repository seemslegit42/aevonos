
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { createContactInDb, listContactsFromDb } from '@/ai/tools/crm-tools';

const ContactCreationRequestSchema = z.object({
  email: z.string().email().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
     if (!user || !workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    // Use the tool function, which is now cached
    const contacts = await listContactsFromDb(workspace.id, user.id);
    return NextResponse.json(contacts);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /contacts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve contacts.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    const body = await request.json();
    const validation = ContactCreationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid contact data.', issues: validation.error.issues }, { status: 400 });
    }
    
    // Use the tool function for consistency and cache invalidation
    const newContact = await createContactInDb(validation.data, workspace.id, user.id);

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /contacts POST]', error);
    return NextResponse.json({ error: 'Failed to create contact.' }, { status: 500 });
  }
}
