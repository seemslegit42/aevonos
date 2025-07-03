
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerActionSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

const EdictUpdateSchema = z.object({
  edicts: z.array(z.object({
      description: z.string().trim().min(1, 'Edict description cannot be empty.'),
      isActive: z.boolean(),
  }))
});

// GET /api/security/edicts
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const edicts = await prisma.securityEdict.findMany({
      where: { workspaceId: sessionUser.workspaceId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(edicts);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /security/edicts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve security edicts.' }, { status: 500 });
  }
}

// PUT /api/security/edicts
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id }});
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
        return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = EdictUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid edict configuration.', issues: validation.error.issues }, { status: 400 });
    }

    const { edicts } = validation.data;
    const { workspaceId } = sessionUser;

    await prisma.$transaction([
      prisma.securityEdict.deleteMany({
        where: { workspaceId },
      }),
      prisma.securityEdict.createMany({
        data: edicts.map(edict => ({
          description: edict.description,
          isActive: edict.isActive,
          workspaceId: workspaceId,
        })),
      }),
    ]);
    
    return NextResponse.json({ message: 'Security edicts updated successfully.' });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /security/edicts PUT]', error);
    return NextResponse.json({ error: 'Failed to update security edicts.' }, { status: 500 });
  }
}
