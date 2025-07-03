
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 7 days
const expiresIn = 60 * 60 * 24 * 7 * 1000;

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();
        
        cookies().set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expiresIn,
            path: '/',
        });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to set session cookie' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        cookies().delete('session');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete session cookie' }, { status: 500 });
    }
}
