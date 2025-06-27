
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ThreatFeedsSchema = z.object({
  feeds: z.array(z.string().url({ message: "Each feed must be a valid URL." })),
});

// Corresponds to operationId `configureThreatFeeds`
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validation = ThreatFeedsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid feed configuration.', 
        issues: validation.error.issues 
      }, { status: 400 });
    }

    // In a real application, you would now save these feeds to a database
    // for the Aegis agent to consume during its analysis runs.
    console.log('Threat intelligence feeds updated:', validation.data.feeds);

    return NextResponse.json({ message: 'Threat intelligence feeds updated successfully.' });

  } catch (error) {
    console.error('[API /security/threat-feeds PUT]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update threat feeds.' }, { status: 500 });
  }
}
