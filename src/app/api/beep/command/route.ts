
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    return NextResponse.json(
        { 
            error: 'This endpoint is deprecated. Please use /api/v1/beep/command.' 
        },
        { 
            status: 410, // Gone
            headers: {
                'Location': '/api/v1/beep/command'
            }
        }
    );
}
