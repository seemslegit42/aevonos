
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getCovenantLeaderboard } from '@/services/admin-service';

interface RouteParams {
  params: {
    covenantName: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { workspace } = await getAuthenticatedUser();
    if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    
    const leaderboard = await getCovenantLeaderboard(workspace.id, params.covenantName);
    return NextResponse.json(leaderboard);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Invalid covenant name')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(`[API /covenants/{covenantName}/leaderboard GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve leaderboard.' }, { status: 500 });
  }
}
