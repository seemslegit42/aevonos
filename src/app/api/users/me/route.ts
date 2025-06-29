
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Schema from api-spec.md for updating a user
const UserUpdateRequestSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

// Corresponds to operationId `getCurrentUser`
export async function GET(request: NextRequest) {
  // Protect the route
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      rank: true,
      xp: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const { password, ...userResponse } = user as any;
  return NextResponse.json(userResponse);
}

// Corresponds to operationId `updateCurrentUser`
export async function PUT(request: NextRequest) {
  // Protect the route
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = UserUpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }

    const user = await prisma.user.update({
        where: { id: session.userId },
        data: validation.data
    });
    
    const { password, ...userResponse } = user;
    return NextResponse.json(userResponse);

  } catch (error) {
    console.error('[API /users/me PUT]', error);
     if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
  }
}
