
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { encrypt } from '@/lib/auth';

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
    // For this demo, we assume the login is successful if the email is provided.
    // Here we'll create a session payload for the JWT.
    
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

    // Create the session payload
    const sessionPayload = {
        userId: mockUser.uuid,
        workspaceId: 'w1a2b3c4-d5e6-f789-0123-456789abcdef', // Mock workspace ID for the demo user
        expires: new Date(Date.now() + 3600 * 1000), // 1 hour from now
    };

    const token = await encrypt(sessionPayload);

    const authResponse = {
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: 3600,
      user: mockUser
    };

    return NextResponse.json(authResponse);

  } catch (error) {
    console.error('[API /auth/login POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
