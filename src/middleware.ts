
import { NextResponse, type NextRequest } from 'next/server';

// This middleware function does nothing and allows all requests to pass through.
// Route protection is now handled by the MainLayout component.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
