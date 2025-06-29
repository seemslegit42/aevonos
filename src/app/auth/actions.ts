
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// --- LOGOUT --- //
export async function logout() {
  cookies().delete('session');
  redirect('/login');
}

// In a real app, this would be a "soft delete" or a more complex process.
// For now, we will just log the user out as a placeholder for this destructive action.
export async function deleteAccount() {
  console.log(`[Action: deleteAccount] Mock account deletion initiated. Logging out.`);
  await logout();
}
