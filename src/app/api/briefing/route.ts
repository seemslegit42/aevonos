import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { generateDailyBriefing } from '@/ai/agents/briefing-agent';

export async function GET(request: Request) {
    try {
        const { user, workspace } = await getAuthenticatedUser();
        if (!user || !workspace) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const briefing = await generateDailyBriefing({
            workspaceId: workspace.id,
            userId: user.id,
            userFirstName: user.firstName || 'Architect',
        });
        
        return NextResponse.json(briefing);

    } catch (error) {
        console.error('[API /briefing GET]', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: `Failed to generate briefing: ${errorMessage}` }, { status: 500 });
    }
}
