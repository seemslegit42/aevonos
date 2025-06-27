
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

// Schema from api-spec.md for updating a user
const UserUpdateRequestSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

const mockUser = {
    id: 1,
    uuid: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Use a static UUID for mocking
    email: 'user@aevonos.com',
    firstName: "Jane",
    lastName: "Doe",
    lastLoginAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
};

// Corresponds to operationId `getCurrentUser`
export async function GET(request: Request) {
  // In a real application, you'd extract the user ID from the JWT
  // and fetch the user from the database.
  // For now, we return a static mock user.
  return NextResponse.json(mockUser);
}

// Corresponds to operationId `updateCurrentUser`
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validation = UserUpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }

    // In a real application, you would update the user in the database.
    // For now, we return the mock user with the updated fields applied.
    const updatedUser = {
        ...mockUser,
        ...validation.data,
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
