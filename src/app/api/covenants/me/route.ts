
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { UserPsyche } from '@prisma/client';

const psycheToCovenantMap = {
  [UserPsyche.SYNDICATE_ENFORCER]: { name: 'Covenant of Motion', symbol: '🜁' },
  [UserPsyche.RISK_AVERSE_ARTISAN]: { name: 'Covenant of Worship', symbol: '🜃' },
  [UserPsyche.ZEN_ARCHITECT]: { name: 'Covenant of Silence', symbol: '🜄' },
};

export async function GET(request: Request) {
  try {
    const { user } = await getAuthenticatedUser();
    const covenant = psycheToCovenantMap[user.psyche];

    if (!covenant) {
      return NextResponse.json({ error: 'Covenant not found for user.' }, { status: 404 });
    }

    return NextResponse.json(covenant);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /covenants/me GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve covenant data.' }, { status: 500 });
  }
}
