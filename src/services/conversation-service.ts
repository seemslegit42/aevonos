
'use server';
/**
 * @fileOverview Service for managing agent conversation history using Redis.
 * Per the DRAGONFLYDB-PROTOCOL, conversation history is transient and lives in the cache.
 */
import cache from '@/lib/cache';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { Serialized } from '@langchain/core/tracers/base';

const MAX_HISTORY_LENGTH = 10; // Keep the last 10 messages for context
const HISTORY_CACHE_KEY = (userId: string) => `convo-history:${userId}`;
const HISTORY_CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Deserializes an array of JSON strings into LangChain BaseMessage instances.
 * @param messagesJsonStrings The array of serialized message strings from Redis.
 * @returns An array of BaseMessage instances.
 */
function deserializeMessages(messagesJsonStrings: string[]): BaseMessage[] {
  return messagesJsonStrings.map((msgString: string) => {
    try {
        const msg = JSON.parse(msgString) as Serialized;
        switch (msg.type) {
          case 'human':
            return new HumanMessage(msg);
          case 'ai':
            return new AIMessage(msg);
          case 'tool':
            return new ToolMessage(msg);
          case 'system':
            return new SystemMessage(msg);
          default:
            console.warn(`Unknown message type encountered during deserialization: ${msg.type}`);
            return new SystemMessage({ content: msgString });
        }
    } catch (e) {
        console.error("Failed to deserialize message:", msgString, e);
        return new SystemMessage({ content: `[Error Deserializing] ${msgString}` });
    }
  });
}

/**
 * Retrieves the recent conversation history for a given user from Redis.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of BaseMessage objects.
 */
export async function getConversationHistory(
  userId: string,
): Promise<BaseMessage[]> {
  const key = HISTORY_CACHE_KEY(userId);
  try {
    const historyStrings = await cache.redis.lrange(key, 0, -1);
    if (historyStrings && historyStrings.length > 0) {
      return deserializeMessages(historyStrings);
    }
  } catch (error) {
    console.error(`[Conversation Service] Failed to retrieve history for user ${userId}:`, error);
  }
  return [];
}

/**
 * Saves the updated conversation history for a user to Redis, trimming it to a max length.
 * @param userId The ID of the user.
 * @param messages The full, updated array of BaseMessage objects for the conversation.
 */
export async function saveConversationHistory(
  userId: string,
  messages: BaseMessage[]
): Promise<void> {
  const key = HISTORY_CACHE_KEY(userId);
  try {
    const serializableMessages = messages
        .slice(-MAX_HISTORY_LENGTH)
        .map((msg) => JSON.stringify(msg.toJSON()));

    // Use a pipeline for atomic execution of multiple commands
    const pipeline = cache.redis.pipeline();
    pipeline.del(key); // Clear the old history
    if (serializableMessages.length > 0) {
        pipeline.rpush(key, ...serializableMessages); // Push the new history
        pipeline.expire(key, HISTORY_CACHE_TTL_SECONDS); // Reset TTL on update
    }
    await pipeline.exec();

  } catch (error) {
    console.error(`[Conversation Service] Failed to save history for user ${userId}:`, error);
  }
}
