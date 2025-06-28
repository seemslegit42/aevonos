
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// --- LOGOUT --- //
export async function logout() {
  cookies().delete('session');
  redirect('/login');
}
