// 'use server';

// /**
//  * @fileOverview Summarizes the previous session's activity and context using GenAI.
//  *
//  * - summarizeSession - A function that summarizes the previous session.
//  * - SummarizeSessionInput - The input type for the summarizeSession function.
//  * - SummarizeSessionOutput - The return type for the summarizeSession function.
//  */

// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';

// const SummarizeSessionInputSchema = z.object({
//   previousSessionData: z.string().describe('Data from the previous session, including user activity, context, and relevant information.'),
// });
// export type SummarizeSessionInput = z.infer<typeof SummarizeSessionInputSchema>;

// const SummarizeSessionOutputSchema = z.object({
//   summary: z.string().describe('A concise summary of the previous session.'),
// });
// export type SummarizeSessionOutput = z.infer<typeof SummarizeSessionOutputSchema>;

// export async function summarizeSession(input: SummarizeSessionInput): Promise<SummarizeSessionOutput> {
//   return summarizeSessionFlow(input);
// }

// const summarizeSessionPrompt = ai.definePrompt({
//   name: 'summarizeSessionPrompt',
//   input: {schema: SummarizeSessionInputSchema},
//   output: {schema: SummarizeSessionOutputSchema},
//   prompt: `You are an AI assistant that summarizes previous sessions to help users quickly resume their work.

//   Summarize the following data from the previous session:
//   {{previousSessionData}}`,
// });

// const summarizeSessionFlow = ai.defineFlow(
//   {
//     name: 'summarizeSessionFlow',
//     inputSchema: SummarizeSessionInputSchema,
//     outputSchema: SummarizeSessionOutputSchema,
//   },
//   async input => {
//     const {output} = await summarizeSessionPrompt(input);
//     return output!;
//   }
// );
