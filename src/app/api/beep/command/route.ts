
import { NextRequest, NextResponse } from 'next/server';
import { processUserCommand } from '@/ai/agents/beep';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const BeepCommandRequestSchema = z.object({
  command: z.string(),
  context: z.record(z.any()).optional().nullable(),
});


export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId || !session?.workspaceId) {
        return NextResponse.json({ error: 'Unauthorized. A valid session token is required.' }, { status: 401 });
    }

    const body = await request.json();
    const validation = BeepCommandRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid command or context.', issues: validation.error.issues }, { status: 400 });
    }

    const { command } = validation.data;

    const beepResult = await processUserCommand({ 
        userCommand: command,
        userId: session.userId,
        workspaceId: session.workspaceId,
    });

    // Adapt the internal UserCommandOutput to the public API response schema from api-spec.md
    const apiResponse = {
      response: beepResult.responseText,
      actionTriggered: {
        appsToLaunch: beepResult.appsToLaunch,
        agentReports: beepResult.agentReports,
      },
    };

    return NextResponse.json(apiResponse, { status: 200 });

  } catch (error) {
    console.error('[BEEP API Error]', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
