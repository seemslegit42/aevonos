
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

// Schema from api-spec.md
const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  workspaceName: z.string(),
});

// Corresponds to operationId `registerUser`
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = RegisterRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid registration request.', issues: validation.error.issues }, { status: 400 });
    }
    
    // In a real application, you would check if the user already exists,
    // then create the user and their workspace in the database.
    // For now, we simulate success.

    const mockUser = {
        id: 2, // new user
        uuid: crypto.randomUUID(),
        email: validation.data.email,
        firstName: validation.data.firstName || "New",
        lastName: validation.data.lastName || "User",
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const mockAuthResponse = {
      accessToken: "mock-jwt-token." + Buffer.from(JSON.stringify({userId: mockUser.uuid})).toString('base64'),
      tokenType: "Bearer",
      expiresIn: 3600,
      user: mockUser
    };

    // Note: The spec says to return AuthResponse with status 201.
    return NextResponse.json(mockAuthResponse, { status: 201 });

  } catch (error) {
    console.error('[API /auth/register POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
