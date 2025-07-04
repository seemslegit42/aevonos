
'use server';
/**
 * @fileOverview Service for managing agent conversation history.
 * Implements a hybrid approach using Redis for fast, short-term memory
 * and PostgreSQL for long-term, persistent conversation archives.
 */
import cache from '@/lib/cache';
import prisma from '@/lib/prisma';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { Serialized } from '@langchain/core/tracers/base';

const SHORT_TERM_HISTORY_LENGTH = 10; // How many recent messages to keep in fast cache
const HISTORY_CACHE_KEY = (userId: string, workspaceId: string) => `convo-history:${workspaceId}:${userId}`;
const HISTORY_CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Deserializes an array of JSON strings or objects into LangChain BaseMessage instances.
 * @param messagesJson An array of serialized message JSON objects or strings.
 * @returns An array of BaseMessage instances.
 */
function deserializeMessages(messagesJson: any[]): BaseMessage[] {
  return messagesJson.map((msg: any) => {
    try {
        const parsedMsg = typeof msg === 'string' ? JSON.parse(msg) as Serialized : msg as Serialized;
        switch (parsedMsg.type) {
          case 'human': return new HumanMessage(parsedMsg);
          case 'ai': return new AIMessage(parsedMsg);
          case 'tool': return new ToolMessage(parsedMsg);
          case 'system': return new SystemMessage(parsedMsg);
          default:
            console.warn(`Unknown message type encountered during deserialization: ${parsedMsg.type}`);
            return new SystemMessage({ content: JSON.stringify(parsedMsg) });
        }
    } catch (e) {
        console.error("Failed to deserialize message:", msg, e);
        return new SystemMessage({ content: `[Error Deserializing] ${JSON.stringify(msg)}` });
    }
  });
}

/**
 * Retrieves the recent conversation history for a given user in a workspace.
 * It first checks the fast Redis cache, and if that's a miss,
 * it falls back to the persistent PostgreSQL database.
 * @param userId The ID of the user.
 * @param workspaceId The ID of the workspace.
 * @returns A promise that resolves to an array of BaseMessage objects.
 */
export async function getConversationHistory(
  userId: string,
  workspaceId: string
): Promise<BaseMessage[]> {
  const cacheKey = HISTORY_CACHE_KEY(userId, workspaceId);

  // 1. Try to fetch from Redis cache first
  try {
    const historyStrings = await cache.redis.lrange(cacheKey, 0, -1);
    if (historyStrings && historyStrings.length > 0) {
      return deserializeMessages(historyStrings);
    }
  } catch (error) {
    console.error(`[Conversation Service] Failed to retrieve history from cache for user ${userId}:`, error);
  }

  // 2. If cache is empty, fall back to the database
  try {
      const conversation = await prisma.conversation.findUnique({
          where: { userId_workspaceId: { userId, workspaceId } },
      });

      if (conversation && Array.isArray(conversation.messages)) {
          const messages = deserializeMessages(conversation.messages);
          const shortTermMessages = messages.slice(-SHORT_TERM_HISTORY_LENGTH);
          
          // 3. Warm up the cache for subsequent requests
          const serializableMessages = shortTermMessages.map((msg) => JSON.stringify(msg.toJSON()));
          
          if (serializableMessages.length > 0) {
              const pipeline = cache.redis.pipeline();
              pipeline.del(cacheKey);
              pipeline.rpush(cacheKey, ...serializableMessages);
              pipeline.expire(cacheKey, HISTORY_CACHE_TTL_SECONDS);
              await pipeline.exec();
          }

          return shortTermMessages;
      }
  } catch (error) {
      console.error(`[Conversation Service] Failed to retrieve history from database for user ${userId}:`, error);
  }

  return [];
}

/**
 * Saves the updated conversation history for a user to both the fast Redis cache
 * (short-term memory) and the persistent PostgreSQL database (long-term memory).
 * @param userId The ID of the user.
 * @param workspaceId The ID of the user's workspace.
 * @param messages The full, updated array of BaseMessage objects for the conversation.
 */
export async function saveConversationHistory(
  userId: string,
  workspaceId: string,
  messages: BaseMessage[]
): Promise<void> {
  const cacheKey = HISTORY_CACHE_KEY(userId, workspaceId);
  const serializableMessages = messages.map((msg) => msg.toJSON());

  try {
      // 1. Write to fast Redis cache (trimmed)
      const shortTermMessagesForCache = serializableMessages
        .slice(-SHORT_TERM_HISTORY_LENGTH)
        .map(msg => JSON.stringify(msg));

      const pipeline = cache.redis.pipeline();
      pipeline.del(cacheKey);
      if (shortTermMessagesForCache.length > 0) {
          pipeline.rpush(cacheKey, ...shortTermMessagesForCache);
          pipeline.expire(cacheKey, HISTORY_CACHE_TTL_SECONDS);
      }
      
      // 2. Write to persistent PostgreSQL DB (full history)
      const dbWrite = prisma.conversation.upsert({
          where: { 
            userId_workspaceId: {
                userId,
                workspaceId,
            }
          },
          create: {
              userId,
              workspaceId,
              messages: serializableMessages,
          },
          update: {
              messages: serializableMessages,
          },
      });

      // Execute both writes in parallel
      await Promise.all([pipeline.exec(), dbWrite]);

  } catch (error) {
    console.error(`[Conversation Service] Failed to save history for user ${userId}:`, error);
  }
}
