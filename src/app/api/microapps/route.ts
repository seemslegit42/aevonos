
import { NextResponse } from 'next/server';
import { artifactManifests } from '@/config/artifacts';

// GET /api/microapps
// Corresponds to the operationId `listMicroApps` in api-spec.md
export async function GET(request: Request) {
  try {
    // Filter for only Micro-Apps, as this endpoint is specific to them.
    const microAppManifests = artifactManifests.filter(a => a.type === 'MICRO_APP');

    // In a production application, you might further filter these manifests
    // based on the authenticated user's plan and permissions.
    return NextResponse.json(microAppManifests);
  } catch (error) {
    console.error('[API /microapps GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve Micro-App manifests.' }, { status: 500 });
  }
}
