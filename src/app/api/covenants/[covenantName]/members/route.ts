
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
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
    const { user, workspace } = await getAuthenticatedUser();
    
    // This is an admin/owner-only endpoint
    if (user.role !== UserRole.ADMIN || user.id !== workspace?.ownerId) {
        return NextResponse.json({ error: 'Forbidden: Architect access required.' }, { status: 403 });
    }

    const psyche = covenantNameToPsyche(params.covenantName);
    if (!psyche) {
      return NextResponse.json({ error: 'Invalid covenant name.' }, { status: 400 });
    }

    const members = await prisma.user.findMany({
      where: {
        psyche: psyche,
        workspaces: {
          some: { id: workspace.id }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return NextResponse.json(members);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /covenants/{covenantName}/members GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve covenant members.' }, { status: 500 });
  }
}
