
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { encrypt } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserPsyche, PlanTier, TransactionType, TransactionStatus, UserRole, Prisma } from '@prisma/client';
import { interpretVow } from '@/ai/agents/invocation-rite-agent';

// Updated schema to reflect the new Rite of Invocation flow
const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  workspaceName: z.string().trim().min(1, { message: "Workspace name cannot be empty." }),
  agentAlias: z.string().optional(),
  psyche: z.nativeEnum(UserPsyche),
  whatMustEnd: z.string().optional(),
  goal: z.string().optional(),
});

// Corresponds to operationId `registerUser`
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = RegisterRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid registration request.', issues: validation.error.issues }, { status: 400 });
    }
    
    const { email, password, workspaceName, agentAlias, psyche, whatMustEnd, goal } = validation.data;
    
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    
    if (existingUser) {
        return NextResponse.json({ error: 'User with email already exists.'}, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to ensure all related records are created successfully
    const { user, workspace } = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                agentAlias: agentAlias || 'BEEP', // Default to BEEP if not provided
                psyche: psyche || UserPsyche.ZEN_ARCHITECT, // Default to ZEN_ARCHITECT
                foundingVow: whatMustEnd,
                foundingGoal: goal,
                role: UserRole.ADMIN, // A user who creates a workspace is its Administrator.
            }
        });
        
        const newWorkspace = await tx.workspace.create({
            data: {
                name: workspaceName,
                ownerId: newUser.id,
                planTier: PlanTier.Apprentice, // All new signups start on the free Apprentice plan
                credits: new Prisma.Decimal(100.0), // Grant initial credits directly.
                members: {
                    connect: { id: newUser.id }
                }
            }
        });
        
        // Log the genesis transaction for the initial credits. This is for the audit trail.
        await tx.transaction.create({
            data: {
                workspaceId: newWorkspace.id,
                type: TransactionType.CREDIT,
                amount: new Prisma.Decimal(100.0),
                description: "Initial Apprentice credit grant.",
                userId: newUser.id,
                status: TransactionStatus.COMPLETED
            }
        });

        return { user: newUser, workspace: newWorkspace };
    });

    // After successful registration, call the invocation agent to get the benediction.
    // This is non-critical; if it fails, registration still succeeds.
    try {
        const invocationResult = await interpretVow({
            whatMustEnd: whatMustEnd || 'the old ways',
            goal: goal || 'a new beginning',
            psyche: psyche,
            agentAlias: agentAlias || 'BEEP',
        });
        // Update the user with the AI-generated data.
        await prisma.user.update({
            where: { id: user.id },
            data: {
                corePainIndex: invocationResult.corePainIndex,
                foundingBenediction: invocationResult.foundingBenediction,
                firstWhisper: invocationResult.firstWhisper,
            }
        });
    } catch (aiError) {
        console.error('[Rite of Invocation AI Error]', aiError);
    }

    const sessionPayload = {
        userId: user.id,
        workspaceId: workspace.id,
        expires: new Date(Date.now() + 3600 * 1000),
    };

    const token = await encrypt(sessionPayload);
    
    // Response must match AuthResponse schema in api-spec.md
    const apiResponse = {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            lastLoginAt: user.lastLoginAt,
        }
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
