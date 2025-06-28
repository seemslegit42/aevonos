
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { encrypt } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Schema from api-spec.md
const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
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
    
    const { email, password, firstName, lastName, workspaceName } = validation.data;
    
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    
    if (existingUser) {
        return NextResponse.json({ error: 'User with email already exists.'}, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to ensure both user and workspace are created successfully
    const { user, workspace } = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
            }
        });
        
        const newWorkspace = await tx.workspace.create({
            data: {
                name: workspaceName,
                ownerId: newUser.id,
                members: {
                    connect: { id: newUser.id }
                }
            }
        });
        
        return { user: newUser, workspace: newWorkspace };
    });


    const sessionPayload = {
        userId: user.id,
        workspaceId: workspace.id,
        expires: new Date(Date.now() + 3600 * 1000),
    };

    const token = await encrypt(sessionPayload);

    const { password: _, ...userResponse } = user;
    
    // Response must match AuthResponse schema in api-spec.md
    const apiResponse = {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: userResponse
    };
    
    const response = NextResponse.json(apiResponse, { status: 201 });

    response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        path: '/',
    });

    return response;

  } catch (error) {
    console.error('[API /auth/register POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
