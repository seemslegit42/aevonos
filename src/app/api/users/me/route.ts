
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

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
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // In a real application, you'd fetch the user from the database using session.userId
  // For now, we return a mock user associated with the session.
  const mockUser = {
    id: 1,
    uuid: session.userId, // Use the ID from the session
    email: 'user@aevonos.com',
    firstName: "Jane",
    lastName: "Doe",
    lastLoginAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(mockUser);
}

// Corresponds to operationId `updateCurrentUser`
export async function PUT(request: NextRequest) {
  // Protect the route
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = UserUpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }

    // In a real application, you would update the user in the database.
    // For now, we return the mock user with the updated fields applied.
    const updatedUser = {
        id: 1,
        uuid: session.userId,
        email: validation.data.email || 'user@aevonos.com',
        firstName: validation.data.firstName || "Jane",
        lastName: validation.data.lastName || "Doe",
        lastLoginAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('[API /users/me PUT]', error);
     if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
  }
}
