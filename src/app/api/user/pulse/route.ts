
'use client';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getUserPulseState } from '@/services/pulse-engine-service';

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const pulseState = await getUserPulseState(user.id);
    return NextResponse.json(pulseState);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /user/pulse GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve pulse state.' }, { status: 500 });
  }
}

    