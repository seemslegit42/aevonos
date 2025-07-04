
'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const newEndpoint = new URL('/api/auth/initiate', request.url);
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Please use /api/auth/initiate.',
      code: 'ENDPOINT_DEPRECATED',
    },
    { 
      status: 410, // Gone
      headers: {
        'Location': newEndpoint.toString()
      }
    }
  );
}
