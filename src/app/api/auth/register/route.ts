
'use server';

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { UserPsyche } from '@prisma/client';

const RegistrationRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  psyche: z.nativeEnum(UserPsyche),
  agentAlias: z.string().optional(),
});

// This endpoint is for creating a Firebase user.
// The rest of the onboarding (creating User/Workspace in Prisma) is in /api/onboarding
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = RegistrationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request.', issues: validation.error.issues }, { status: 400 });
    }

    const { email, password, firstName, lastName } = validation.data;

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName || ''} ${lastName || ''}`.trim(),
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    }
    console.error('[API /auth/register POST]', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
