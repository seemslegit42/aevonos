
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPulseNarrative } from '@/services/pulse-engine-service';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const narrative = await getPulseNarrative(session.userId);
    return NextResponse.json({ narrative });
  } catch (error) {
    console.error(`[API /user/pulse GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve pulse narrative.' }, { status: 500 });
  }
}
