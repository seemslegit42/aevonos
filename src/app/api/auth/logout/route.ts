
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
}
