
'use server';
/**
 * @fileOverview Service for managing agent conversation history.
 */
import prisma from '@/lib/prisma';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';

const MAX_HISTORY_LENGTH = 10; // Keep the last 10 messages for context

/**
 * Deserializes an array of JSON objects into LangChain BaseMessage instances.
 * @param messagesJson The array of JSON message objects from the database.
 * @returns An array of BaseMessage instances.
 */
function deserializeMessages(messagesJson: any[]): BaseMessage[] {
  return messagesJson.map((msg: any) => {
    // The toJSON() method on BaseMessage includes a 'type' field.
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
        // Fallback for older formats or unknown types
        console.warn(`Unknown message type encountered during deserialization: ${msg.type}`);
        return new SystemMessage({ content: JSON.stringify(msg) });
    }
  });
}

/**
 * Retrieves the recent conversation history for a given user.
 * @param userId The ID of the user.
 * @param workspaceId The ID of the current workspace.
 * @returns A promise that resolves to an array of BaseMessage objects.
 */
export async function getConversationHistory(
  userId: string,
  workspaceId: string
): Promise<BaseMessage[]> {
  const conversation = await prisma.conversation.findUnique({
    where: { userId },
  });

  if (conversation && Array.isArray(conversation.messages)) {
    // The history in DB is already trimmed, so we just deserialize.
    return deserializeMessages(conversation.messages);
  }

  return [];
}

/**
 * Saves the updated conversation history for a user, trimming it to a max length.
 * @param userId The ID of the user.
 * @param workspaceId The ID of the current workspace.
 * @param messages The full, updated array of BaseMessage objects for the conversation.
 */
export async function saveConversationHistory(
  userId: string,
  workspaceId: string,
  messages: BaseMessage[]
): Promise<void> {
  // LangChain messages have a toJSON() method that we can use for serialization.
  const serializableMessages = messages.map((msg) => msg.toJSON());

  // Keep only the most recent messages to prevent the history from growing indefinitely.
  const trimmedMessages = serializableMessages.slice(-MAX_HISTORY_LENGTH);

  await prisma.conversation.upsert({
    where: { userId },
    create: {
      userId,
      workspaceId,
      messages: trimmedMessages,
    },
    update: {
      messages: trimmedMessages,
    },
  });
}
