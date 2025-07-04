
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getPulseEngineConfig, updatePulseEngineConfig } from '@/services/config-service';
import { z } from 'zod';

const UpdateSchema = z.object({
  pityThreshold: z.number().int().min(2).max(15).optional(),
  festivalTriggerPercent: z.number().int().min(5).max(75).optional(),
  transmutationTithe: z.number().min(0.01).max(0.5).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { user: sessionUser, workspace } = await getAuthenticatedUser();

    if (!workspace || workspace.ownerId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }

    const config = await getPulseEngineConfig(workspace.id);
    // Convert Decimal to number for client-side consumption
    const responseData = {
      ...config,
      transmutationTithe: Number(config.transmutationTithe),
    };
    return NextResponse.json(responseData);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('token expired') || error.message.includes('no token'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/config/pulse-engine GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve Pulse Engine config.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user: sessionUser, workspace } = await getAuthenticatedUser();
    if (!workspace || workspace.ownerId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }
    
    const body = await request.json();
    const validation = UpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid config data.', issues: validation.error.issues }, { status: 400 });
    }
    
    const updatedConfig = await updatePulseEngineConfig(workspace.id, validation.data);
    const responseData = {
      ...updatedConfig,
      transmutationTithe: Number(updatedConfig.transmutationTithe),
    };
    return NextResponse.json(responseData);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('token expired') || error.message.includes('no token'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/config/pulse-engine PUT]', error);
    return NextResponse.json({ error: 'Failed to update Pulse Engine config.' }, { status: 500 });
  }
}
