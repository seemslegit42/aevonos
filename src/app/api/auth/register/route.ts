
'use server';

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { UserPsyche, PlanTier, TransactionType, TransactionStatus, UserRole, Prisma } from '@prisma/client';
import { interpretVow } from '@/ai/agents/invocation-rite-agent';

// This new schema combines registration and onboarding data.
const FullRegistrationRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  workspaceName: z.string().trim().min(1),
  agentAlias: z.string().optional(),
  psyche: z.nativeEnum(UserPsyche),
  whatMustEnd: z.string().optional(),
  goal: z.string().optional(),
});


export async function POST(request: Request) {
  try {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK is not initialized. Cannot create user.");
    }
    const body = await request.json();
    const validation = FullRegistrationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request.', issues: validation.error.issues }, { status: 400 });
    }

    const { email, password, workspaceName, agentAlias, psyche, whatMustEnd, goal } = validation.data;

    // Step 1: Create Firebase user
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: workspaceName,
    });
    
    // Step 2: Create Prisma user
    const newUser = await prisma.user.create({
        data: {
            id: firebaseUser.uid, // Use Firebase UID as the primary key
            email: firebaseUser.email!,
            agentAlias: agentAlias || 'BEEP',
            psyche: psyche || UserPsyche.ZEN_ARCHITECT,
            foundingVow: whatMustEnd,
            foundingGoal: goal,
            role: UserRole.ADMIN, // First user is always the Architect
        }
    });

    // Step 3: Create the workspace and initial records in a single transaction
    await prisma.$transaction(async (tx) => {
      const newWorkspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          ownerId: newUser.id,
          planTier: PlanTier.Apprentice,
          credits: new Prisma.Decimal(100.0),
          members: {
            connect: { id: newUser.id },
          },
        },
      });

      await tx.pulseProfile.create({
        data: {
          userId: newUser.id,
          phaseOffset: Math.random() * 2 * Math.PI,
        },
      });

      await tx.transaction.create({
        data: {
          workspaceId: newWorkspace.id,
          type: TransactionType.CREDIT,
          amount: new Prisma.Decimal(100.0),
          description: "Initial Apprentice credit grant.",
          userId: newUser.id,
          status: TransactionStatus.COMPLETED,
        },
      });
    });

    // Step 4: Generate the founding benediction
    let benediction = null;
    try {
        const invocationResult = await interpretVow({
            whatMustEnd: whatMustEnd || 'the old ways',
            goal: goal || 'a new beginning',
            psyche: psyche,
            agentAlias: agentAlias || 'BEEP',
        });
        await prisma.user.update({
            where: { id: newUser.id },
            data: {
                corePainIndex: invocationResult.corePainIndex,
                foundingBenediction: invocationResult.foundingBenediction,
                firstWhisper: invocationResult.firstWhisper,
                firstCommand: invocationResult.firstCommand,
            }
        });
        benediction = invocationResult.foundingBenediction;
    } catch (aiError) {
        console.error('[Rite of Invocation AI Error]', aiError);
    }
    
    return NextResponse.json({ success: true, userId: newUser.id, benediction }, { status: 201 });

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    }
    console.error('[API /auth/register POST]', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
