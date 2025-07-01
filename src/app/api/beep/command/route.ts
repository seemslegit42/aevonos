
import { NextRequest, NextResponse } from 'next/server';
import { processUserCommand } from '@/ai/agents/beep';
import { auth } from '@/auth';
import { z } from 'zod';

const BeepCommandRequestSchema = z.object({
  command: z.string(),
  context: z.record(z.any()).optional().nullable(),
});


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.workspaceId) {
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
        userId: session.user.id,
        workspaceId: session.user.workspaceId,
        psyche: session.user.psyche,
        role: session.user.role,
    });

    // Adapt the internal UserCommandOutput to the public API response schema from api-spec.md.
    // This provides a simpler, more ID-like summary for external consumers.
    const actionSummary = {
        launchedApps: beepResult.appsToLaunch.map(app => app.type),
        generatedReports: beepResult.agentReports?.map(report => report.agent) ?? [],
        suggestedCommandsCount: beepResult.suggestedCommands.length,
    };
    
    const apiResponse = {
      response: beepResult.responseText,
      actionTriggered: actionSummary,
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
