
'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { revalidatePath } from 'next/cache';
import { drSyntaxCritique } from '@/ai/agents/dr-syntax';
import type { DrSyntaxInput, DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import { recallSession, type SessionRecallInput, type SessionRecallOutput } from '@/ai/agents/echo';
import { generatePamRant as generatePamRantFlow } from '@/ai/agents/pam-poovey';
import type { PamScriptInput, PamAudioOutput } from '@/ai/agents/pam-poovey-schemas';
import { deployDecoy as deployDecoyFlow } from '@/ai/agents/decoy';
import type { DecoyInput, DecoyOutput } from '@/ai/agents/decoy-schemas';
import { performInfidelityAnalysis as performInfidelityAnalysisFlow } from '@/ai/agents/infidelity-analysis';
import type { InfidelityAnalysisInput, InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import { validateVin as validateVinFlow } from '@/ai/agents/vin-diesel';
import type { VinDieselInput, VinDieselOutput } from '@/ai/agents/vin-diesel-schemas';
import { analyzeInvite as analyzeInviteFlow } from '@/ai/agents/lumbergh';
import type { LumberghAnalysisInput, LumberghAnalysisOutput } from '@/ai/agents/lumbergh-schemas';
import { analyzeExpense as analyzeExpenseLucilleFlow } from '@/ai/agents/lucille-bluth';
import type { LucilleBluthInput, LucilleBluthOutput } from '@/ai/agents/lucille-bluth-schemas';
import { analyzeCandidate as analyzeCandidateFlow } from '@/ai/agents/rolodex';
import type { RolodexAnalysisInput, RolodexAnalysisOutput } from '@/ai/agents/rolodex-schemas';
import { generateSolution as generateSolutionFlow } from '@/ai/agents/winston-wolfe';
import type { WinstonWolfeInput, WinstonWolfeOutput } from '@/ai/agents/winston-wolfe-schemas';
import { analyzeComms as analyzeCommsFlow } from '@/ai/agents/kif-kroker';
import type { KifKrokerAnalysisInput, KifKrokerAnalysisOutput } from '@/ai/agents/kif-kroker-schemas';
import { createVandelayAlibi as createVandelayAlibiFlow } from '@/ai/agents/vandelay';
import type { VandelayAlibiInput, VandelayAlibiOutput } from '@/ai/agents/vandelay-schemas';
import { scanEvidence as scanEvidenceFlow } from '@/ai/agents/paper-trail';
import type { PaperTrailScanInput, PaperTrailScanOutput } from '@/ai/agents/paper-trail-schemas';
import { generateBusinessKit as generateBusinessKitFlow } from '@/ai/agents/jroc';
import type { JrocInput, JrocOutput } from '@/ai/agents/jroc-schemas';
import { analyzeLaheyLog as analyzeLaheyLogFlow } from '@/ai/agents/lahey';
import type { LaheyAnalysisInput, LaheyAnalysisOutput } from '@/ai/agents/lahey-schemas';
import { processDailyLog } from '@/ai/agents/foremanator';
import type { ForemanatorLogInput, ForemanatorLogOutput } from '@/ai/agents/foremanator-schemas';
import { analyzeCompliance as analyzeComplianceFlow } from '@/ai/agents/sterileish';
import type { SterileishAnalysisInput, SterileishAnalysisOutput } from '@/ai/agents/sterileish-schemas';
import { generateWingmanMessage as generateWingmanMessageFlow } from '@/ai/agents/wingman';
import type { WingmanInput, WingmanOutput } from '@/ai/agents/wingman-schemas';
import { performOsintScan as performOsintScanFlow } from '@/ai/agents/osint';
import type { OsintInput, OsintOutput } from '@/ai/agents/osint-schemas';


export async function handleCommand(command: string): Promise<UserCommandOutput> {
  try {
    const result = await processUserCommand({ userCommand: command });
    revalidatePath('/');
    return result;
  } catch (error) {
    console.error('Error processing command:', error);
    return {
        appsToLaunch: [],
        agentReports: [],
        suggestedCommands: ['Error: Could not process command.'],
        responseText: 'My apologies, I encountered an internal error and could not process your command.'
    };
  }
}

export async function checkForAnomalies(activityDescription: string): Promise<{ isAnomalous: boolean; anomalyExplanation: string; }> {
    try {
        const result = await aegisAnomalyScan({ activityDescription });
        return result;
    } catch (error) {
        console.error('Error detecting anomalies:', error);
        return { isAnomalous: false, anomalyExplanation: "Error during scan." };
    }
}

export async function handleDrSyntaxCritique(input: DrSyntaxInput): Promise<DrSyntaxOutput> {
  try {
    const result = await drSyntaxCritique(input);
    return result;
  } catch (error) {
    console.error('Error in Dr. Syntax critique:', error);
    // Return a sarcastic error message in character
    return {
      critique: "I tried to process your request, but the sheer mediocrity of the input seems to have crashed my advanced systems. Or perhaps it was just a server error. It's hard to tell the difference with this level of input.",
      suggestion: "Try again, but with a modicum of effort this time.",
      rating: 1,
    };
  }
}

export async function recallSessionAction(input: SessionRecallInput): Promise<SessionRecallOutput> {
  try {
    const result = await recallSession(input);
    return result;
  } catch (error) {
    console.error('Error in Echo recall:', error);
    return {
      summary: "I tried to remember what happened, but the memory is fuzzy. There might have been a system error.",
      keyPoints: ["Could not retrieve session details."],
    };
  }
}

export async function generatePamRant(input: PamScriptInput): Promise<PamAudioOutput> {
  try {
    const result = await generatePamRantFlow(input);
    return result;
  } catch (error) {
    console.error('Error in Pam Poovey rant flow:', error);
    return {
      script: "I'd tell you what you need to know, but my glass is empty and so is my soul. Also, there was a server error.",
      audioDataUri: '',
    };
  }
}

export async function handleDeployDecoy(input: DecoyInput): Promise<DecoyOutput> {
  try {
    const result = await deployDecoyFlow(input);
    return result;
  } catch (error) {
    console.error('Error deploying decoy:', error);
    return {
      decoyMessage: "The agent failed to generate a message. The target's profile might be too powerful, or there was a server error.",
    };
  }
}

export async function handleInfidelityAnalysis(input: InfidelityAnalysisInput): Promise<InfidelityAnalysisOutput> {
  try {
    const result = await performInfidelityAnalysisFlow(input);
    return result;
  } catch (error) {
    console.error('Error in infidelity analysis flow:', error);
    return {
      riskScore: -1, // Use a sentinel value for error
      riskSummary: "The agent could not complete the analysis due to a system error. The signal may have been lost.",
      keyFactors: [],
    };
  }
}

export async function handleVinDieselValidation(input: VinDieselInput): Promise<VinDieselOutput> {
    try {
        const result = await validateVinFlow(input);
        return result;
    } catch (error) {
        console.error('Error in VIN Diesel validation flow:', error);
        return {
            vin: input.vin,
            isValid: false,
            statusMessage: "The engine sputtered. There was a server error, try again.",
        };
    }
}

export async function analyzeInvite(input: LumberghAnalysisInput): Promise<LumberghAnalysisOutput> {
  try {
    const result = await analyzeInviteFlow(input);
    return result;
  } catch (error) {
    console.error('Error in Project Lumbergh analysis flow:', error);
    return {
      isFlagged: true,
      flagReason: "Yeeeeah, my own internal TPS reports are showing an error right now, so I can't really look at this. Mmmkay?",
      declineMemos: [],
    };
  }
}

export async function analyzeExpense(input: LucilleBluthInput): Promise<LucilleBluthOutput> {
  try {
    const result = await analyzeExpenseLucilleFlow(input);
    return result;
  } catch (error) {
    console.error('Error in Lucille Bluth analysis flow:', error);
    return {
      judgmentalRemark: "I tried to process that, but the sheer effort was exhausting. There was probably a server error. Get me a vodka rocks.",
    };
  }
}

export async function analyzeCandidate(input: RolodexAnalysisInput): Promise<RolodexAnalysisOutput> {
    try {
        const result = await analyzeCandidateFlow(input);
        return result;
    } catch (error) {
        console.error('Error in Rolodex analysis flow:', error);
        return {
            fitScore: 0,
            icebreaker: "Analysis failed. Let's put a pin in that.",
            summary: "Could not generate summary due to a server error.",
        };
    }
}

export async function generateSolution(input: WinstonWolfeInput): Promise<WinstonWolfeOutput> {
    try {
        const result = await generateSolutionFlow(input);
        return result;
    } catch (error) {
        console.error('Error in Winston Wolfe solution flow:', error);
        return {
            suggestedResponse: "I seem to have encountered a problem of my own. A server error. I'll handle it.",
        };
    }
}

export async function analyzeComms(input: KifKrokerAnalysisInput): Promise<KifKrokerAnalysisOutput> {
  try {
    const result = await analyzeCommsFlow(input);
    return result;
  } catch (error) {
    console.error('Error in Kif Kroker analysis flow:', error);
    return {
      moraleLevel: 'Sigh',
      wearyNudge: "*Sigh* The sub-wave communicator seems to be malfunctioning. Probably for the best. Also, there was a server error.",
      passiveAggressionIndex: 0,
      burnoutProbability: 0,
    };
  }
}

export async function createVandelayAlibi(input: VandelayAlibiInput): Promise<VandelayAlibiOutput> {
  try {
    const result = await createVandelayAlibiFlow(input);
    return result;
  } catch (error) {
    console.error('Error in Vandelay alibi flow:', error);
    return {
      title: "Error: Could not generate alibi due to a critical synergy failure.",
      attendees: [],
    };
  }
}

export async function scanEvidence(input: PaperTrailScanInput): Promise<PaperTrailScanOutput> {
    try {
        const result = await scanEvidenceFlow(input);
        return result;
    } catch (error) {
        console.error('Error in Paper Trail scan flow:', error);
        return {
            vendor: 'Unknown',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            lead: "The informant went dark. Call couldn't go through. Probably a server error.",
            isEvidenceValid: false,
        }
    }
}

export async function generateBusinessKit(input: JrocInput): Promise<JrocOutput> {
    try {
        const result = await generateBusinessKitFlow(input);
        return result;
    } catch (error) {
        console.error('Error in J-ROC flow:', error);
        return {
            businessName: "Rock Pile Pictures",
            tagline: "It's not a rock pile, it's a rock-solid business, know'm sayin'?",
            logoDescription: "Aight check it, server's down, so this logo is just a drawing of a microphone on a napkin. It's abstract, aight?",
        };
    }
}

export async function analyzeLaheyLog(input: LaheyAnalysisInput): Promise<LaheyAnalysisOutput> {
    try {
        const result = await analyzeLaheyLogFlow(input);
        return result;
    } catch (error) {
        console.error('Error in Lahey analysis flow:', error);
        return {
            employee: 'Unknown',
            timestamp: new Date().toISOString(),
            event: 'Surveillance feed corrupted.',
            shitstorm_index: 100,
            lahey_commentary: "The liquor couldn't process the signal, bud. The shit-hawks might have gotten to the servers."
        };
    }
}

export async function handleForemanatorLog(input: ForemanatorLogInput): Promise<ForemanatorLogOutput> {
    try {
        const result = await processDailyLog(input);
        return result;
    } catch (error) {
        console.error('Error in Foremanator log processing:', error);
        return {
            summary: "Report machine's broken. Get back to work.",
            tasksCompleted: [],
            materialsUsed: [],
            blockers: ['Server error.'],
            foremanatorCommentary: "You think these reports write themselves? Fix the server."
        };
    }
}

export async function analyzeCompliance(input: SterileishAnalysisInput): Promise<SterileishAnalysisOutput> {
    try {
        const result = await analyzeComplianceFlow(input);
        return result;
    } catch (error) {
        console.error('Error in STERILE-ish analysis:', error);
        return {
            isCompliant: false,
            complianceNotes: "Analysis failed. The sample was probably contaminated. Or the server is.",
            sterileRating: 0,
            snarkySummary: "The system is down. Everything is probably a biohazard now."
        };
    }
}

export async function generateWingmanMessage(input: WingmanInput): Promise<WingmanOutput> {
  try {
    const result = await generateWingmanMessageFlow(input);
    return result;
  } catch (error) {
    console.error('Error in Wingman message generation flow:', error);
    return {
      suggestedMessage: "My circuits must be crossed, because I can't think of a thing to say. There was a server error.",
      cringeScore: 100,
      vibe: 'You Will Regret This',
      analysis: 'The agent failed to generate a response, which is maximum cringe.',
      regretShieldTriggered: true,
      regretShieldReason: 'Internal system error detected. Sending now would be highly unpredictable.',
    };
  }
}

export async function handleOsintScan(input: OsintInput): Promise<OsintOutput> {
  try {
    const result = await performOsintScanFlow(input);
    return result;
  } catch (error) {
    console.error('Error in OSINT scan flow:', error);
    return {
      summary: "The agent could not complete the OSINT scan due to a system error. The digital trail went cold.",
      riskFactors: [],
      socialProfiles: [],
      publicRecords: [],
      digitalFootprint: {
        overallVisibility: 'Low',
        keyObservations: ["Scan failed due to an internal error."],
      }
    };
  }
}
