// This mock API has been deprecated. OSINT logic is now handled by agentic tools.
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 });
}
