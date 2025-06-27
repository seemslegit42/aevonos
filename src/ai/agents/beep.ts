'use server';

/**
 * @fileOverview This file defines the BEEP agent kernel using LangGraph.
 * BEEP (Behavioral Event & Execution Processor) is the central orchestrator of ΛΞVON OS.
 *
 * - processUserCommand - The function to call to process the command.
 * - UserCommandInput - The input type for the processUserCommand function.
 * - UserCommandOutput - The output type for the processUserCommand function.
 */

import { z } from 'zod';
import { StateGraph, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { Tool } from '@langchain/core/tools';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { geminiModel } from '@/ai/genkit';
import { drSyntaxCritique } from '@/ai/agents/dr-syntax';
import {
  DrSyntaxInputSchema,
  DrSyntaxOutputSchema,
} from '@/ai/agents/dr-syntax-schemas';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { AegisAnomalyScanOutputSchema, type AegisAnomalyScanOutput } from './aegis-schemas';
import { createContactInDb, listContactsFromDb, deleteContactInDb, updateContactInDb } from '@/ai/tools/crm-tools';
import { CreateContactInputSchema, ContactSchema, DeleteContactInputSchema, DeleteContactOutputSchema, UpdateContactInputSchema } from '@/ai/tools/crm-schemas';
import {
    type UserCommandInput,
    UserCommandOutputSchema,
    type UserCommandOutput,
    AgentReportSchema,
} from './beep-schemas';


// LangChain Tool Definitions
class DrSyntaxTool extends Tool {
  name = 'critiqueContent';
  description = 'Sends content to Dr. Syntax for a harsh but effective critique. Use this when a user asks for a review, critique, or feedback on a piece of text, code, or a prompt. Extract the content and content type from the user command.';
  schema = DrSyntaxInputSchema;
  
  async _call(input: z.infer<typeof DrSyntaxInputSchema>) {
    const result = await drSyntaxCritique(input);
    return JSON.stringify(result);
  }
}

class CreateContactTool extends Tool {
    name = 'createContact';
    description = 'Creates a new contact in the system. Use this when the user asks to "add a contact", "new contact", etc. Extract their details like name, email, and phone from the user command.';
    schema = CreateContactInputSchema;

    async _call(input: z.infer<typeof CreateContactInputSchema>) {
        const result = await createContactInDb(input);
        return JSON.stringify(result);
    }
}

class UpdateContactTool extends Tool {
    name = 'updateContact';
    description = 'Updates an existing contact in the system. Use this when the user asks to "change a contact", "update details for", etc. You must provide the contact ID. If the user provides a name, use the listContacts tool first to find the correct ID.';
    schema = UpdateContactInputSchema;

    async _call(input: z.infer<typeof UpdateContactInputSchema>) {
        const result = await updateContactInDb(input);
        return JSON.stringify(result);
    }
}

class ListContactsTool extends Tool {
    name = 'listContacts';
    description = 'Lists all contacts in the system. Use this when the user asks to "show contacts", "list all contacts", "see my contacts", etc.';
    schema = z.object({}); // No input

    async _call() {
        const result = await listContactsFromDb();
        return JSON.stringify(result);
    }
}

class DeleteContactTool extends Tool {
    name = 'deleteContact';
    description = 'Deletes a contact from the system by their ID. The user must provide the ID of the contact to delete. You should obtain this ID from a contact list if the user does not provide it.';
    schema = DeleteContactInputSchema;

    async _call(input: z.infer<typeof DeleteContactInputSchema>) {
        const result = await deleteContactInDb(input);
        return JSON.stringify(result);
    }
}


const tools = [new DrSyntaxTool(), new CreateContactTool(), new UpdateContactTool(), new ListContactsTool(), new DeleteContactTool()];
const modelWithTools = geminiModel.bind({
  tools: tools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.schema),
    },
  })),
});


// LangGraph State
interface AgentState {
  messages: BaseMessage[];
}

const callAegis = async (state: AgentState) => {
    const { messages } = state;
    const humanMessage = messages.find(m => m instanceof HumanMessage);
    if (!humanMessage) {
        throw new Error("Could not find user command for Aegis scan.");
    }
    const userCommand = (humanMessage.content as string).replace(/User Command: /, '');


    const report = await aegisAnomalyScan({ activityDescription: `User command: "${userCommand}"` });
    
    const aegisSystemMessage = new SystemMessage({
        content: `AEGIS_INTERNAL_REPORT::${JSON.stringify({source: 'Aegis', report})}`
    });
    
    return { messages: [aegisSystemMessage] };
}

const callModel = async (state: AgentState) => {
  const { messages } = state;
  const response = await modelWithTools.invoke(messages);
  return { messages: [response] };
};

const shouldContinue = (state: AgentState) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (
    'tool_calls' in lastMessage &&
    lastMessage.tool_calls &&
    lastMessage.tool_calls.length > 0
  ) {
    return 'tools';
  }
  return 'end';
};

const toolNode = new ToolNode<AgentState>(tools);

const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      value: (x, y) => x.concat(y),
      default: () => [],
    },
  },
});

workflow.addNode('aegis', callAegis);
workflow.addNode('agent', callModel);
workflow.addNode('tools', toolNode);

workflow.setEntryPoint('aegis');
workflow.addEdge('aegis', 'agent');
workflow.addConditionalEdges('agent', shouldContinue, {
  continue: 'tools',
  end: END,
});
workflow.addEdge('tools', 'agent');

const app = workflow.compile();


// Public-facing function to process user commands
export async function processUserCommand(input: UserCommandInput): Promise<UserCommandOutput> {
  const initialPrompt = `You are BEEP (Behavioral Event & Execution Processor), the central orchestrator of ΛΞVON OS. Your primary function is to interpret user commands, use tools to delegate to other agents, and translate the results into a final JSON object conforming to the UserCommandOutputSchema.
  
  You will receive a System Message starting with 'AEGIS_INTERNAL_REPORT::'. This is a security analysis from our primordial bodyguard, Aegis. You MUST parse this JSON, understand it, and incorporate its findings into your final response. The full Aegis report MUST be added to the 'agentReports' array of your final JSON output under the agent name 'aegis'. If the report indicates anomalous activity, you must proceed with caution.

  Your process:
  1. Analyze the user's command AND the Aegis security report from the System Message.
  2. If the command requires a tool (e.g., creating a contact, listing contacts, getting a critique), you MUST use the appropriate tool.
  3. If the user is asking to open an app (e.g., "open terminal"), populate the 'appsToLaunch' array in your final JSON output. The available apps are: 'file-explorer', 'terminal', 'echo-control'.
  4. After all tools have been called and you have all the information, construct a final, single JSON object that strictly follows this schema: ${JSON.stringify(zodToJsonSchema(UserCommandOutputSchema))}.
  5. Your final response MUST be ONLY this JSON object. Do not add any conversational text around it.
  6. The 'agentReports' array in the JSON output must be populated with the results of any tool calls you made, AND the Aegis report from the initial system message.

  User Command: ${input.userCommand}`;


  const result = await app.invoke({
    messages: [new HumanMessage(initialPrompt)],
  });

  // Extract all agent reports from the full message history
  const agentReports: z.infer<typeof AgentReportSchema>[] = [];
  
  for (const msg of result.messages) {
      if (msg instanceof SystemMessage && msg.content.startsWith('AEGIS_INTERNAL_REPORT::')) {
          try {
              const reportJson = JSON.parse(msg.content.replace('AEGIS_INTERNAL_REPORT::', ''));
              agentReports.push({ agent: 'aegis', report: AegisAnomalyScanOutputSchema.parse(reportJson.report) });
          } catch (e) {
              console.error("Failed to parse Aegis report from SystemMessage:", e);
          }
      } else if (msg instanceof ToolMessage) {
           try {
              const toolOutput = JSON.parse(msg.content as string);
              if (msg.name === 'critiqueContent') {
                  agentReports.push({ agent: 'dr-syntax', report: DrSyntaxOutputSchema.parse(toolOutput) });
              } else if (msg.name === 'createContact') {
                  agentReports.push({ agent: 'crm', report: { action: 'create', report: ContactSchema.parse(toolOutput) }});
              } else if (msg.name === 'updateContact') {
                  agentReports.push({ agent: 'crm', report: { action: 'update', report: ContactSchema.parse(toolOutput) }});
              } else if (msg.name === 'listContacts') {
                  agentReports.push({ agent: 'crm', report: { action: 'list', report: z.array(ContactSchema).parse(toolOutput) }});
              } else if (msg.name === 'deleteContact') {
                  agentReports.push({ agent: 'crm', report: { action: 'delete', report: DeleteContactOutputSchema.parse(toolOutput) }});
              }
          } catch (e) {
              console.error("Failed to parse tool message content:", e);
          }
      }
  }


  // Take the last AIMessage, which should be the final JSON object.
  const lastMessage = result.messages[result.messages.length - 1];
  if (lastMessage._getType() === 'ai' && typeof lastMessage.content === 'string') {
      try {
          const parsed = UserCommandOutputSchema.parse(JSON.parse(lastMessage.content));
          // Inject the agent reports gathered from the tool calls, ensuring no duplicates
          const existingReports = new Set(parsed.agentReports?.map(r => JSON.stringify(r)) || []);
          const allReports = [...(parsed.agentReports || []), ...agentReports.filter(r => !existingReports.has(JSON.stringify(r)))];
          
          parsed.agentReports = allReports;
          return parsed;

      } catch (e) {
          console.error("Failed to parse final AI message into UserCommandOutputSchema", e);
          // Fallback if parsing fails
          return {
              responseText: lastMessage.content || "I apologize, but I encountered an issue processing the final response.",
              appsToLaunch: [],
              agentReports: agentReports, // Still return reports if we have them
              suggestedCommands: ["Try rephrasing your command."],
          };
      }
  }

  // Final fallback
  return {
    responseText: "My apologies, I was unable to produce a valid response.",
    appsToLaunch: [],
    agentReports: [],
    suggestedCommands: ["Please try again."],
  };
}
