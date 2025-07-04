
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getOverviewStats } from '@/services/admin-service';

export async function GET(request: NextRequest) {
  try {
    const { user: sessionUser, workspace } = await getAuthenticatedUser();

    if (!workspace || workspace.ownerId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }

    const overview = await getOverviewStats(workspace.id);

    return NextResponse.json(overview);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('token expired') || error.message.includes('no token'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/overview GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve overview data.' }, { status: 500 });
  }
}
