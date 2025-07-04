
'use server';

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { UserPsyche, PlanTier, TransactionType, TransactionStatus, UserRole, Prisma } from '@prisma/client';
import { interpretVow } from '@/ai/agents/invocation-rite-agent';

// This new schema removes the password.
const FullRegistrationRequestSchema = z.object({
  email: z.string().email(),
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

    const { email, workspaceName, agentAlias, psyche, whatMustEnd, goal } = validation.data;

    // Step 1: Create Firebase user without a password
    const firebaseUser = await admin.auth().createUser({
      email,
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
    
    // Instead of signing in, we now inform the user to check their email for their first sign-in link.
    // We will trigger the same magic link flow as the login page.
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const continueUrl = `${protocol}://${host}/auth/action`;

    const actionCodeSettings = {
      url: continueUrl,
      handleCodeInApp: true,
    };
    const link = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'oracle@aevonos.com',
      to: email,
      subject: 'The Echo | Your Sovereign Signature',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 2rem; background: #0a0a0c; color: #f5f5f5;">
          <h1 style="color: #6A0DAD;">Your First Whisper</h1>
          <p>Your pact is forged. Your OS awaits. Follow this first echo to claim your canvas.</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; margin-top: 1rem; background: #6A0DAD; color: white; text-decoration: none; border-radius: 8px;">Enter the Canvas</a>
          <p style="font-size: 12px; color: #888; margin-top: 2rem;">This echo will dissipate in 15 minutes.</p>
        </div>
      `,
    });
    
    return NextResponse.json({ success: true, userId: newUser.id, benediction }, { status: 201 });

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    }
    console.error('[API /auth/register POST]', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
