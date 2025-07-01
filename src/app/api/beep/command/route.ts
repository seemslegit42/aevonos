
import { NextRequest, NextResponse } from 'next/server';
import { processUserCommand } from '@/ai/agents/beep';
import { getServerActionSession } from '@/lib/auth';
import { z } from 'zod';

const BeepCommandRequestSchema = z.object({
  command: z.string(),
  context: z.record(z.any()).optional().nullable(),
});


export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();

    const body = await request.json();
    const validation = BeepCommandRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid command or context.', issues: validation.error.issues }, { status: 400 });
    }

    const { command } = validation.data;

    const beepResult = await processUserCommand({ 
        userCommand: command,
        userId: sessionUser.id,
        workspaceId: sessionUser.workspaceId,
        psyche: sessionUser.psyche,
        role: sessionUser.role,
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
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[BEEP API Error]', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
