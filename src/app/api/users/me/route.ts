
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';

// Schema from api-spec.md for updating a user
const UserUpdateRequestSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  agentAlias: z.string().optional().nullable(),
});

// Corresponds to operationId `getCurrentUser`
export async function GET(request: NextRequest) {
  try {
    const { user: sessionUser } = await getAuthenticatedUser();
    
    if (!sessionUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // The 'select' clause ensures we only get public fields, so this is safe.
    return NextResponse.json(sessionUser);
  } catch (error) {
     if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /users/me GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve user.' }, { status: 500 });
  }
}

// Corresponds to an extension of `getCurrentWorkspace` for updates
export async function PUT(request: NextRequest) {
  try {
    const { user: sessionUser } = await getAuthenticatedUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    const body = await request.json();
    const validation = UserUpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
        where: { id: sessionUser.id },
        data: validation.data
    });
    
    // Invalidate the cache for this user
    await cache.del(`user:${sessionUser.id}`);

    // Explicitly construct the response to match the public User schema.
    const userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        agentAlias: updatedUser.agentAlias,
        role: updatedUser.role,
        lastLoginAt: updatedUser.lastLoginAt,
        unlockedChaosCardKeys: updatedUser.unlockedChaosCardKeys,
    };
    return NextResponse.json(userResponse);

  } catch (error) {
     if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /users/me PUT]', error);
    return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
  }
}
