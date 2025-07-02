
import { NextResponse } from "next/server";

// Effectively disable the NextAuth routes by immediately redirecting to the root page.
// This prevents any NextAuth-related pages or errors from showing.
const redirectUrl = new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000');

export async function GET() {
  return NextResponse.redirect(redirectUrl);
}
export async function POST() {
  return NextResponse.redirect(redirectUrl);
}
