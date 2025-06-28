
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

const ThreatFeedsSchema = z.object({
  feeds: z.array(z.string().url({ message: "Each feed must be a valid URL." })),
});

// Corresponds to operationId `getThreatFeeds`
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const feeds = await prisma.threatFeed.findMany({
      where: {
        workspaceId: session.workspaceId,
      },
      select: {
        id: true,
        url: true,
      },
    });
    return NextResponse.json(feeds);
  } catch (error) {
    console.error('[API /security/threat-feeds GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve threat feeds.' }, { status: 500 });
  }
}

// Corresponds to operationId `configureThreatFeeds`
export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = ThreatFeedsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid feed configuration.', 
        issues: validation.error.issues 
      }, { status: 400 });
    }

    const { feeds } = validation.data;
    const { workspaceId } = session;

    // Use a transaction to ensure atomicity: delete old feeds and create new ones.
    await prisma.$transaction([
      prisma.threatFeed.deleteMany({
        where: { workspaceId },
      }),
      prisma.threatFeed.createMany({
        data: feeds.map((url) => ({
          url: url,
          workspaceId: workspaceId,
        })),
      }),
    ]);

    return NextResponse.json({ message: 'Threat intelligence feeds updated successfully.' });

  } catch (error) {
    console.error('[API /security/threat-feeds PUT]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update threat feeds.' }, { status: 500 });
  }
}
