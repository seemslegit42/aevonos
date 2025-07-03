
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { UserPsyche, PlanTier, TransactionType, TransactionStatus, UserRole, Prisma } from '@prisma/client';
import { interpretVow } from '@/ai/agents/invocation-rite-agent';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

// Schema for the onboarding payload from the /register/vow page
const OnboardingRequestSchema = z.object({
  workspaceName: z.string().trim().min(1, { message: "Workspace name cannot be empty." }),
  agentAlias: z.string().optional(),
  psyche: z.nativeEnum(UserPsyche),
  whatMustEnd: z.string().optional(),
  goal: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { user: firebaseUser } = await getAuthenticatedUser();
    if (!firebaseUser) {
        return NextResponse.json({ error: 'Unauthorized. No authenticated user found.' }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: firebaseUser.id },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User has already been onboarded.' }, { status: 409 });
    }

    const body = await request.json();
    const validation = OnboardingRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid onboarding request.', issues: validation.error.issues }, { status: 400 });
    }
    
    const { workspaceName, agentAlias, psyche, whatMustEnd, goal } = validation.data;
    
    // We already have the Firebase User ID, so we use that.
    const newUser = await prisma.user.create({
        data: {
            id: firebaseUser.id, // Use Firebase UID as the primary key
            email: firebaseUser.email!,
            agentAlias: agentAlias || 'BEEP',
            psyche: psyche || UserPsyche.ZEN_ARCHITECT,
            foundingVow: whatMustEnd,
            foundingGoal: goal,
            role: UserRole.ADMIN, // First user is always the Architect
        }
    });

    // Create the workspace and initial records in a single transaction
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


    // Generate the founding benediction after the user is created
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
            }
        });
        benediction = invocationResult.foundingBenediction;
    } catch (aiError) {
        console.error('[Rite of Invocation AI Error]', aiError);
    }
    
    return NextResponse.json({ success: true, userId: newUser.id, benediction }, { status: 201 });

  } catch (error) {
    if (error instanceof Error && error.message.includes('token expired')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /onboarding POST]', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
