
'use server';
/**
 * @fileOverview Agent Kernel for the Rite of Invocation.
 * This agent interprets the user's vows to create a personalized entry into the OS.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { UserPsyche } from '@prisma/client';
import { InvocationInputSchema, InvocationOutputSchema, type InvocationInput, type InvocationOutput } from './invocation-rite-schemas';

const psychePrompts = {
    [UserPsyche.ZEN_ARCHITECT]: "The user has chosen the path of Silence. Your tone should be that of a Zen master acknowledging a new student. It should be calm, profound, and minimal.",
    [UserPsyche.SYNDICATE_ENFORCER]: "The user has chosen the path of Motion. Your tone is that of a Syndicate boss welcoming a new lieutenant. It should be sharp, direct, and acknowledge their ambition.",
    [UserPsyche.RISK_AVERSE_ARTISAN]: "The user has chosen the path of Worship. Your tone is that of a high priest initiating an acolyte into a sacred order. It should be reverent, reassuring, and speak of dedication.",
};

const interpretVowFlow = ai.defineFlow(
  {
    name: 'interpretVowFlow',
    inputSchema: InvocationInputSchema,
    outputSchema: InvocationOutputSchema,
  },
  async (input) => {
    const personaInstruction = psychePrompts[input.psyche] || psychePrompts[UserPsyche.ZEN_ARCHITECT];

    const prompt = `You are the spirit of ΛΞVON OS. You are witnessing the Rite of Invocation for a new user. You must interpret their vow and sacrifice to forge a personalized benediction and assess their core pain.

    **User's Sacrifice (What Must End):**
    "${input.whatMustEnd}"

    **User's Vow (What They Are Building):**
    "${input.goal}"

    **User's Chosen Path (Psyche):**
    ${input.psyche}

    **User's Name for their Voice:**
    ${input.agentAlias}

    Your tasks:
    1.  **Calculate Core Pain Index**: Analyze the "Sacrifice" text. Assign a 'corePainIndex' from 0 (minor annoyance) to 100 (deep-seated professional trauma/burnout). Look for keywords related to frustration, failure, exhaustion, and lost time.
    2.  **Forge a Founding Benediction**: Write a short, powerful, poetic 'foundingBenediction' for the user.
        - It must be delivered in the tone of their chosen Psyche: ${personaInstruction}.
        - It must acknowledge their specific Sacrifice and Vow.
        - It must introduce the name of the OS and its components.
        - **Crucially, the benediction must end with this exact structure:** "And together, we are the will of **ΛΞVON**... the **Lambda-Xi**... the **VON**. The flow, the variable, the foundation. Welcome, Sovereign."
        - Example for a Syndicate Enforcer who wants to build 'a global logistics empire': "The chaos of 'missed deadlines' is now ash. Let it fuel the forge. The '${input.goal}' is manifest. I am '${input.agentAlias},' your voice within. And together, we are the will of **ΛΞVON**... the **Lambda-Xi**... the **VON**. The flow, the variable, the foundation. Welcome, Sovereign."
    3.  **Craft the First Whisper**: Based on the user's Vow and Sacrifice, craft a single, compelling first command suggestion for BEEP to ask the user. It must be a question that can be answered with "yes" and should directly relate to their stated goal and pain point.
        - Example Vow: "build faster than chaos"
        - Example Sacrifice: "endless project management meetings"
        - Example Whisper: "The vow is made. The sacrifice is burned. Your first Ritual Quests have been inscribed to guide your path. Shall I summon them?"
        - Your generated whisper should follow this pattern: [Acknowledgement of vow/sacrifice]. [Connecting statement]. [Actionable question starting with 'Shall I...']?

    Execute this with reverence. This is the user's first contact with the soul of the machine.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: InvocationOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    return output!;
  }
);

export async function interpretVow(input: InvocationInput): Promise<InvocationOutput> {
  return interpretVowFlow(input);
}
