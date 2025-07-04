
import { NextRequest, NextResponse } from 'next/server';
import { processUserCommand } from '@/ai/agents/beep';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { z } from 'zod';

const BeepCommandRequestSchema = z.object({
  command_text: z.string().describe("The natural language command to be processed by BEEP."),
  context: z.enum(['core_os', 'folly_instrument']).optional().describe("The context from which the command is being issued."),
  canvas_state: z.record(z.any()).optional().describe("A snapshot of the current state of all Micro-Apps on the canvas."),
});


export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    
    if (!user || !workspace) {
      return NextResponse.json({ error: 'User or workspace not found. Onboarding may be incomplete.' }, { status: 404 });
    }

    const body = await request.json();
    const validation = BeepCommandRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid command or context.', issues: validation.error.issues }, { status: 400 });
    }

    const { command_text, context } = validation.data;

    const beepResult = await processUserCommand({ 
        userCommand: command_text,
        userId: user.id,
        workspaceId: workspace.id,
        psyche: user.psyche,
        role: user.role,
        activeAppContext: context,
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
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[BEEP API Error]', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
