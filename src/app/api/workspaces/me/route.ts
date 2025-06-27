
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Corresponds to operationId `getCurrentWorkspace`
export async function GET(request: Request) {
  // In a real application, you'd extract the workspace ID from the JWT
  // and fetch the workspace from the database.
  // For now, we return a static mock workspace.

  const mockWorkspace = {
    id: 1,
    uuid: 'w1a2b3c4-d5e6-f789-0123-456789abcdef', // static UUID for mocking
    name: "Acme Inc.",
    planTier: "pro",
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(mockWorkspace);
}
