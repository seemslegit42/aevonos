
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { encrypt } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    
    const workspace = await prisma.workspace.findFirst({
        where: { ownerId: user.id }
    });
    
    if (!workspace) {
        return NextResponse.json({ error: 'User does not have a primary workspace.' }, { status: 403 });
    }

    // Create the session payload
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour from now
    const sessionPayload = {
        userId: user.id,
        workspaceId: workspace.id,
        expires: expires,
    };

    const token = await encrypt(sessionPayload);
    
    // We don't want to send the password hash back to the client
    const { password: _, ...userResponse } = user;

    // Response must match AuthResponse schema in api-spec.md
    const apiResponse = {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: userResponse
    };
    
    const response = NextResponse.json(apiResponse);

    response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expires, // Use expires instead of maxAge
        path: '/',
    });

    return response;

  } catch (error) {
    console.error('[API /auth/login POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
