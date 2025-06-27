import { NextResponse } from 'next/server';
import { z } from 'zod';

const OsintRequestSchema = z.object({
  targetName: z.string(),
});

const MOCK_OSINT_DATA: Record<string, any> = {
    'alex': {
        summary: "Target 'Alex' maintains a moderate-to-high public digital footprint. Key findings include an active but recently sanitized Instagram profile and public Venmo transactions that do not align with reported activities. High probability of a concealed secondary social life.",
        riskFactors: [
            "Venmo transaction history is public and includes payments to unknown individuals for 'drinks' and 'fun times'.",
            "Instagram profile recently had a large number of photos deleted or archived.",
            "LinkedIn profile shows skills in 'Strategic Communications', indicating potential for sophisticated deception."
        ],
        socialProfiles: [
            { platform: 'LinkedIn', username: 'alex-smith-pro', url: 'https://linkedin.com/in/alex-smith-pro', recentActivity: "Updated job title to 'Senior Strategist'.", privacyLevel: 'Public' },
            { platform: 'Instagram', username: 'a_smith_adventures', url: 'https://instagram.com/a_smith_adventures', recentActivity: "No posts in the last 3 weeks. Follower count has decreased.", privacyLevel: 'Suspiciously Private' },
            { platform: 'Venmo', username: 'Alex-Smith-123', url: 'https://venmo.com/u/Alex-Smith-123', recentActivity: "Transactions to 'Jenna-R' for '✨' and 'Mikey-P' for 'Last night'.", privacyLevel: 'Public' },
        ],
        publicRecords: [
            "No criminal records found in local county search.",
            "Vehicle registration matches a 2022 Blue Sedan.",
        ],
        digitalFootprint: {
            overallVisibility: 'High',
            keyObservations: ["Discrepancy between public social activity and private behavior.", "Evidence of data sanitization on Instagram."]
        }
    },
    'sam': {
        summary: "Target 'Sam' operates as a digital ghost. Extremely low visibility across all major platforms. This level of privacy is unusual and can be a risk factor in itself, indicating a deliberate effort to avoid detection.",
        riskFactors: [
            "Absence of any public-facing social media is statistically anomalous for their demographic.",
            "The name 'Sam Jones' returns over 10,000 public records, making positive identification without further data impossible."
        ],
        socialProfiles: [],
        publicRecords: [
            "Multiple individuals named 'Sam Jones' in the area. No definitive match can be made from available data."
        ],
        digitalFootprint: {
            overallVisibility: 'Ghost',
            keyObservations: ["Deliberate evasion of a digital footprint.", "Use of a common name complicates passive intelligence gathering."]
        }
    }
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = OsintRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid OSINT request.', issues: validation.error.issues }, { status: 400 });
        }

        const { targetName } = validation.data;
        const normalizedName = targetName.toLowerCase();
        
        let responseData;

        if (normalizedName.includes('alex')) {
            responseData = MOCK_OSINT_DATA['alex'];
        } else if (normalizedName.includes('sam')) {
            responseData = MOCK_OSINT_DATA['sam'];
        } else {
            responseData = {
                summary: `No significant intelligence found for target '${targetName}'. The individual maintains a low-profile or operates under a different alias.`,
                riskFactors: ["Low digital footprint makes passive analysis difficult."],
                socialProfiles: [],
                publicRecords: ["No records found matching the provided name."],
                digitalFootprint: {
                    overallVisibility: 'Low',
                    keyObservations: ["No public-facing accounts discovered."]
                }
            };
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('[API /integrations/osint POST]', error);
        return NextResponse.json({ error: 'OSINT scan failed due to a server error.' }, { status: 500 });
    }
}
