
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

// Schema from api-spec.md
const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Corresponds to operationId `loginUser`
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = LoginRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid login request.', issues: validation.error.issues }, { status: 400 });
    }

    // In a real application, you would validate the user's credentials against the database.
    // For now, we will return a mock successful response if the input is valid.

    const mockUser = {
        id: 1,
        uuid: crypto.randomUUID(),
        email: validation.data.email,
        firstName: "Jane",
        lastName: "Doe",
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const mockAuthResponse = {
      accessToken: "mock-jwt-token." + Buffer.from(JSON.stringify({userId: mockUser.uuid})).toString('base64'),
      tokenType: "Bearer",
      expiresIn: 3600,
      user: mockUser
    };

    return NextResponse.json(mockAuthResponse);

  } catch (error) {
    console.error('[API /auth/login POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
