
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { generateDailyBriefing } from '@/ai/agents/briefing-agent';
import cache from '@/lib/cache';

const BRIEFING_CACHE_KEY = (userId: string) => `briefing:${userId}:${new Date().toISOString().split('T')[0]}`; // Cache per day
const BRIEFING_CACHE_TTL = 60 * 60 * 12; // 12 hours

export async function GET(request: Request) {
    try {
        const { user, workspace } = await getAuthenticatedUser();
        if (!user || !workspace) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const cacheKey = BRIEFING_CACHE_KEY(user.id);
        const cachedBriefing = await cache.get(cacheKey);
        if (cachedBriefing) {
            return NextResponse.json(cachedBriefing);
        }

        const briefing = await generateDailyBriefing({
            workspaceId: workspace.id,
            userId: user.id,
            userFirstName: user.firstName || 'Architect',
        });
        
        await cache.set(cacheKey, briefing, 'EX', BRIEFING_CACHE_TTL);
        
        return NextResponse.json(briefing);

    } catch (error) {
        console.error('[API /briefing GET]', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: `Failed to generate briefing: ${errorMessage}` }, { status: 500 });
    }
}
