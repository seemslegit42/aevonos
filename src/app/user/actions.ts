'use server';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { calculateVasForUser } from '@/services/vas-service';

export async function getUserVas(): Promise<number> {
    const { user } = await getAuthenticatedUser();
    if (!user) {
        return 0;
    }
    return calculateVasForUser(user.id);
}
