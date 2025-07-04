
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getWorkspaceUsers } from '@/services/admin-service';

export async function GET(request: NextRequest) {
  try {
    const { user: sessionUser, workspace } = await getAuthenticatedUser();
    
    if (!workspace || !sessionUser || sessionUser.id !== workspace.ownerId) {
      return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }

    const usersInWorkspace = await getWorkspaceUsers(workspace.id);

    return NextResponse.json(usersInWorkspace);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('token expired') || error.message.includes('no token'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/users GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve users.' }, { status: 500 });
  }
}
