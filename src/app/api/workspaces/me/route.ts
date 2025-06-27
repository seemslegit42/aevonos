
import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

// Corresponds to operationId `getCurrentWorkspace`
export async function GET(request: NextRequest) {
  // Protect the route
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // In a real application, you'd fetch the workspace from the database using session.workspaceId
  const mockWorkspace = {
    id: 1,
    uuid: session.workspaceId, // Use the ID from the session
    name: "Acme Inc.",
    planTier: "pro",
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(mockWorkspace);
}
