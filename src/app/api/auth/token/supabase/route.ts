
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import jwt from 'jsonwebtoken';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const JWT_EXPIRATION = '15m'; // Supabase JWTs should be short-lived

export async function GET(request: Request) {
  if (!SUPABASE_JWT_SECRET) {
    console.error('SUPABASE_JWT_SECRET is not set. Cannot mint Supabase token.');
    return NextResponse.json({ error: 'Service is not configured.' }, { status: 500 });
  }

  try {
    const { user, workspace } = await getAuthenticatedUser();
    
    if (!user || !workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // The payload for the Supabase JWT.
    // 'sub' is the standard claim for subject (user ID).
    // We add custom claims for workspace and role for our RLS policies.
    const payload = {
      sub: user.id,
      workspace_id: workspace.id,
      role: user.role, // 'authenticated' is a default Supabase role, but our specific role is better
      iss: 'aevon-os', // Issuer
    };

    const token = jwt.sign(
      payload,
      SUPABASE_JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    return NextResponse.json({ token });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /auth/token/supabase GET]', error);
    return NextResponse.json({ error: 'Failed to mint Supabase token.' }, { status: 500 });
  }
}
