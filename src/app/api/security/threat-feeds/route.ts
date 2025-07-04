
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { UserRole } from '@prisma/client';
import { getThreatFeeds, updateThreatFeeds } from '@/services/security-service';

const ThreatFeedsSchema = z.object({
  feeds: z.array(z.string().url({ message: "Each feed must be a valid URL." })),
});

// Corresponds to operationId `getThreatFeeds`
export async function GET(request: NextRequest) {
  try {
    const { workspace } = await getAuthenticatedUser();
    if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    const feeds = await getThreatFeeds(workspace.id);
    return NextResponse.json(feeds);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /security/threat-feeds GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve threat feeds.' }, { status: 500 });
  }
}

// Corresponds to operationId `configureThreatFeeds`
export async function PUT(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
        return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = ThreatFeedsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid feed configuration.', 
        issues: validation.error.issues 
      }, { status: 400 });
    }

    await updateThreatFeeds(workspace.id, validation.data.feeds);

    return NextResponse.json({ message: 'Threat intelligence feeds updated successfully.' });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /security/threat-feeds PUT]', error);
    return NextResponse.json({ error: 'Failed to update threat feeds.' }, { status: 500 });
  }
}
