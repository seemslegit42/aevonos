
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerActionSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const sessionUser = await getServerActionSession();
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        agentAlias: true,
        lastLoginAt: true,
        unlockedChaosCardKeys: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // The 'select' clause ensures we only get public fields, so this is safe.
    return NextResponse.json(user);
  } catch (error) {
     if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /users/me GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve user.' }, { status: 500 });
  }
}

// Corresponds to an extension of `getCurrentWorkspace` for updates
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const body = await request.json();
    const validation = UserUpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
        where: { id: sessionUser.id },
        data: validation.data
    });
    
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
