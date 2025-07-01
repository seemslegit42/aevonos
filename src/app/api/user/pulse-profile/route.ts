
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const pulseProfile = await prisma.pulseProfile.findUnique({
        where: { userId: session.user.id }
    });
    
    if (!pulseProfile) {
        // This should theoretically not happen because getPulseProfile in services creates one.
        // But handle it just in case.
        return NextResponse.json({ error: 'Pulse profile not found.' }, { status: 404 });
    }

    return NextResponse.json(pulseProfile);
  } catch (error) {
    console.error(`[API /user/pulse-profile GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve pulse profile.' }, { status: 500 });
  }
}
