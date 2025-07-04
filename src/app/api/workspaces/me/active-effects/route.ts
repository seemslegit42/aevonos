
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getActiveEffectsForWorkspace } from '@/services/effects-service';

/**
 * @fileOverview API endpoint to retrieve active system effects (e.g., from Chaos Cards) for the current workspace.
 * This is used by the main layout to apply dynamic themes or other global UI changes.
 */

export async function GET(request: Request) {
  try {
    const { workspace } = await getAuthenticatedUser();
    
    // If no authenticated user/workspace, there are no effects.
    if (!workspace) {
      return NextResponse.json([]);
    }
    
    const activeEffects = await getActiveEffectsForWorkspace(workspace.id);
    
    return NextResponse.json(activeEffects);

  } catch (error) {
    // If a user is not logged in, `getAuthenticatedUser` will throw, and we can treat that as "no effects active".
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json([]);
    }
    
    console.error('[API /workspaces/me/active-effects GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve active system effects.' }, { status: 500 });
  }
}
