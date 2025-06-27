
import { NextResponse } from 'next/server';
import { processUserCommand } from '@/ai/agents/beep';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'Command is required and must be a string.' }, { status: 400 });
    }

    // In a production environment, you would validate the bearer token here.
    // const authorization = request.headers.get('Authorization');
    // if (!authorization || !authorization.startsWith('Bearer ')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const token = authorization.split(' ')[1];
    // ... validate token and get user/tenant info ...

    const beepResult = await processUserCommand({ userCommand: command });

    // Adapt the internal UserCommandOutput to the public API response schema from api-spec.md
    const apiResponse = {
      response: beepResult.responseText,
      actionTriggered: {
        appsToLaunch: beepResult.appsToLaunch,
        agentReports: beepResult.agentReports,
      },
      // Note: suggestedCommands is not part of the public API spec, so it's omitted for this endpoint.
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
