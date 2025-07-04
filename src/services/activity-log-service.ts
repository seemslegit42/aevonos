
'use server';
/**
 * @fileOverview Service for logging and retrieving recent user activity for security analysis.
 */
import cache from '@/lib/cache';

const ACTIVITY_LOG_KEY_PREFIX = 'activity-log:';
const MAX_LOG_ENTRIES = 20; // Keep the last 20 actions
const LOG_EXPIRATION_SECONDS = 60 * 15; // Expire log after 15 minutes of inactivity

/**
 * Logs a user's activity to the cache.
 * @param userId The ID of the user performing the action.
 * @param activityDescription A description of the action.
 */
export async function logUserActivity(userId: string, activityDescription: string): Promise<void> {
  if (!userId) return;

  const key = `${ACTIVITY_LOG_KEY_PREFIX}${userId}`;
  const logEntry = {
    timestamp: new Date().toISOString(),
    activity: activityDescription,
  };
  
  try {
    const existingLogRaw = await cache.get(key);
    const existingLog = existingLogRaw ? JSON.parse(existingLogRaw) : [];
    const newLog = [logEntry, ...existingLog].slice(0, MAX_LOG_ENTRIES);
    await cache.set(key, JSON.stringify(newLog), 'EX', LOG_EXPIRATION_SECONDS);
  } catch (error) {
    console.error(`[Activity Log Service] Failed to log activity for user ${userId}:`, error);
  }
}

/**
 * Retrieves a user's recent activity history from the cache.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of activity log strings.
 */
export async function getUserActivityHistory(userId: string): Promise<string[]> {
  if (!userId) return [];
  const key = `${ACTIVITY_LOG_KEY_PREFIX}${userId}`;
  try {
    const historyRaw = await cache.get(key);
    const history = historyRaw ? JSON.parse(historyRaw) : [];
    return history.map((entry: any) => `[${entry.timestamp}] ${entry.activity}`);
  } catch (error) {
    console.error(`[Activity Log Service] Failed to retrieve activity for user ${userId}:`, error);
    return [];
  }
}
