
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import { UserPsyche, UserRole } from '@prisma/client';
import { calculateVasForUser } from '@/services/vas-service';

interface RouteParams {
  params: {
    covenantName: string;
  };
}

const covenantNameToPsyche = (name: string): UserPsyche | null => {
    switch(name.toLowerCase()) {
        case 'motion': return UserPsyche.SYNDICATE_ENFORCER;
        case 'worship': return UserPsyche.RISK_AVERSE_ARTISAN;
        case 'silence': return UserPsyche.ZEN_ARCHITECT;
        default: return null;
    }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const sessionUser = await getServerActionSession();
    
    // This is a public-facing endpoint for now, but could be restricted.
    
    const psyche = covenantNameToPsyche(params.covenantName);
    if (!psyche) {
      return NextResponse.json({ error: 'Invalid covenant name.' }, { status: 400 });
    }

    const members = await prisma.user.findMany({
      where: {
        psyche: psyche,
        workspaces: {
          some: { id: sessionUser.workspaceId }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Calculate VAS for each member
    const leaderboardPromises = members.map(async (member) => {
        const vas = await calculateVasForUser(member.id);
        return { ...member, vas };
    });

    const leaderboard = (await Promise.all(leaderboardPromises)).sort((a, b) => b.vas - a.vas);

    return NextResponse.json(leaderboard);

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /covenants/{covenantName}/leaderboard GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve leaderboard.' }, { status: 500 });
  }
}
