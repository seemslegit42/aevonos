
import { NextRequest, NextResponse } from 'next/server';
import { getServerActionSession } from '@/lib/auth';
import { getUserPulseState } from '@/services/pulse-engine-service';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const pulseState = await getUserPulseState(sessionUser.id);
    return NextResponse.json(pulseState);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /user/pulse GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve pulse state.' }, { status: 500 });
  }
}
