
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { UserRole } from '@prisma/client';

const EdictUpdateSchema = z.object({
  edicts: z.array(z.object({
      description: z.string().trim().min(1, 'Edict description cannot be empty.'),
      isActive: z.boolean(),
  }))
});

const EDICT_CACHE_KEY = (workspaceId: string) => `edicts:${workspaceId}`;

// GET /api/security/edicts
export async function GET(request: NextRequest) {
  try {
    const { workspace } = await getAuthenticatedUser();
    if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    const edicts = await prisma.securityEdict.findMany({
      where: { workspaceId: workspace.id },
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
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
        return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = EdictUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid edict configuration.', issues: validation.error.issues }, { status: 400 });
    }

    const { edicts } = validation.data;
    
    await prisma.$transaction([
      prisma.securityEdict.deleteMany({
        where: { workspaceId: workspace.id },
      }),
      prisma.securityEdict.createMany({
        data: edicts.map(edict => ({
          description: edict.description,
          isActive: edict.isActive,
          workspaceId: workspace.id,
        })),
      }),
    ]);
    
    // Invalidate the cache for security edicts
    const cacheKey = EDICT_CACHE_KEY(workspace.id);
    await cache.del(cacheKey);

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
