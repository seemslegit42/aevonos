
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { UserRole } from '@prisma/client';
import { getCovenantMembers } from '@/services/admin-service';

interface RouteParams {
  params: {
    covenantName: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    
    // This is an admin/owner-only endpoint
    if (!workspace || user.role !== UserRole.ADMIN || user.id !== workspace.ownerId) {
        return NextResponse.json({ error: 'Forbidden: Architect access required.' }, { status: 403 });
    }
    
    const members = await getCovenantMembers(workspace.id, params.covenantName);
    return NextResponse.json(members);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Invalid covenant name')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(`[API /covenants/{covenantName}/members GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve covenant members.' }, { status: 500 });
  }
}
