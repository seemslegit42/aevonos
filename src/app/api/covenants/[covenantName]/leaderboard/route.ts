
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import { UserPsyche, UserRole } from '@prisma/client';

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
        corePainIndex: true, // Use this as a proxy for VAS calculation
      },
    });

    // Mock Vow Alignment Score (VAS) calculation
    const leaderboard = members.map(member => ({
        ...member,
        vas: Math.floor(Math.random() * 500) + (100 - (member.corePainIndex || 50)) * 5, // A mock score
    })).sort((a, b) => b.vas - a.vas);

    return NextResponse.json(leaderboard);

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /covenants/{covenantName}/leaderboard GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve leaderboard.' }, { status: 500 });
  }
}
