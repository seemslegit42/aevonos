
'use server';

/**
 * @fileOverview Defines the baseline probability weights and potential boons for all Instruments of Folly.
 * This is the Abacus of Fates, the raw truth before the Sine-Rhythm Engine applies its modulations.
 */

export type Boon = {
    type: 'credits' | 'chaos_card' | 'system_effect';
    value: number | string; // Credit multiplier or card key or effect name
    weight: number;
}

export type OutcomeTier = {
    tier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'MYTHIC' | 'DIVINE';
    baseWeight: number; // Out of 10,000 for easy percentage understanding
    boons: Boon[];
    narrativeTriggers: string[];
}

export type FollyInstrumentConfig = {
    id: string;
    rarityTable: OutcomeTier[];
}

// Rarity table for Sisyphus's Ascent
const sisyphusAscentRarityTable: OutcomeTier[] = [
    {
        tier: 'COMMON',
        baseWeight: 7499,
        boons: [{ type: 'credits', value: 0, weight: 100 }],
        narrativeTriggers: ["The boulder slips.", "The incline steepens."],
    },
    {
        tier: 'UNCOMMON',
        baseWeight: 1500,
        boons: [
            { type: 'credits', value: 0.5, weight: 50 },
            { type: 'credits', value: 1.0, weight: 40 },
            { type: 'credits', value: 1.5, weight: 10 },
        ],
        narrativeTriggers: ["A moment of purchase.", "A brief reprieve."],
    },
    {
        tier: 'RARE',
        baseWeight: 850,
        boons: [
            { type: 'credits', value: 3, weight: 60 },
            { type: 'credits', value: 5, weight: 30 },
            { type: 'chaos_card', value: 'WEEPING_GLASS', weight: 10 },
        ],
        narrativeTriggers: ["A foothold is found.", "The path levels, briefly."],
    },
    {
        tier: 'MYTHIC',
        baseWeight: 150,
        boons: [
            { type: 'credits', value: 25, weight: 70 },
            { type: 'credits', value: 50, weight: 20 },
            { type: 'chaos_card', value: 'GORDIAN_KNOT', weight: 10 },
        ],
        narrativeTriggers: ["The peak seems... possible.", "A favor from a minor god."],
    },
    {
        tier: 'DIVINE',
        baseWeight: 1, // This is not a random roll; it's a forced outcome pool for Pity Boons and special events.
        boons: [
            { type: 'system_effect', value: 'SISYPHUS_REPRIEVE', weight: 50 },
            { type: 'system_effect', value: 'PSYCHE_MATRIX_RESONANCE', weight: 50 },
        ],
        narrativeTriggers: ["The gods take notice.", "The cosmic balance shifts. A small favor has been granted, Sovereign."],
    },
];

// Rarity table for Oracle of Delphi (Valley)
const oracleOfDelphiValleyRarityTable: OutcomeTier[] = [
    {
        tier: 'COMMON',
        baseWeight: 7000,
        boons: [{ type: 'credits', value: 0, weight: 100 }],
        narrativeTriggers: ["The Oracle is silent.", "The offering was insufficient."],
    },
    {
        tier: 'UNCOMMON',
        baseWeight: 2000,
        boons: [
            { type: 'credits', value: 1.0, weight: 60 },
            { type: 'credits', value: 1.5, weight: 40 },
        ],
        narrativeTriggers: ["A faint whisper is heard.", "The mists swirl with possibility."],
    },
    {
        tier: 'RARE',
        baseWeight: 850,
        boons: [
            { type: 'credits', value: 4, weight: 60 },
            { type: 'credits', value: 8, weight: 30 },
            { type: 'chaos_card', value: 'SOCRATIC_METHOD', weight: 10 },
        ],
        narrativeTriggers: ["The prophecy is clear.", "A vision of unicorns and term sheets."],
    },
    {
        tier: 'MYTHIC',
        baseWeight: 149,
        boons: [
            { type: 'credits', value: 50, weight: 70 },
            { type: 'credits', value: 100, weight: 20 },
            { type: 'chaos_card', value: 'KRONOSS_GIFT', weight: 10 },
        ],
        narrativeTriggers: ["IPO! The heavens rain gold!", "A divine series-A funding round."],
    },
    {
        tier: 'DIVINE', // Pity Boon
        baseWeight: 1,
        boons: [{ type: 'credits', value: 1.5, weight: 100 }],
        narrativeTriggers: ["The Oracle grants a small favor to encourage your faith."],
    },
];

// Rarity table for Merchant of Cabbage
const merchantOfCabbageRarityTable: OutcomeTier[] = [
    {
        tier: 'COMMON',
        baseWeight: 6000,
        boons: [{ type: 'credits', value: 0, weight: 100 }],
        narrativeTriggers: ["A rival cabbage merchant undercuts your prices.", "MY CABBAGES!!"],
    },
    {
        tier: 'UNCOMMON',
        baseWeight: 2500,
        boons: [
            { type: 'credits', value: 1.2, weight: 80 },
            { type: 'credits', value: 2.0, weight: 20 },
        ],
        narrativeTriggers: ["A good day at the market.", "You sell a particularly fine specimen."],
    },
    {
        tier: 'RARE',
        baseWeight: 1350,
        boons: [
            { type: 'credits', value: 5, weight: 80 },
            { type: 'chaos_card', value: 'MYCELIAL_NETWORK', weight: 20 },
        ],
        narrativeTriggers: ["The king's chef buys your entire stock for the royal feast."],
    },
    {
        tier: 'MYTHIC',
        baseWeight: 149,
        boons: [
            { type: 'credits', value: 75, weight: 90 },
            { type: 'chaos_card', value: 'ROSETTA_STONE', weight: 10 },
        ],
        narrativeTriggers: ["You have established a cabbage empire that spans the seven seas."],
    },
    {
        tier: 'DIVINE', // Pity Boon
        baseWeight: 1,
        boons: [{ type: 'credits', value: 1.5, weight: 100 }],
        narrativeTriggers: ["A kind stranger buys a cabbage out of pity."],
    },
];


export const follyInstrumentsConfig: Record<string, FollyInstrumentConfig> = {
    'SISYPHUSS_ASCENT': {
        id: 'SISYPHUSS_ASCENT',
        rarityTable: sisyphusAscentRarityTable,
    },
    'ORACLE_OF_DELPHI_VALLEY': {
        id: 'ORACLE_OF_DELPHI_VALLEY',
        rarityTable: oracleOfDelphiValleyRarityTable,
    },
    'MERCHANT_OF_CABBAGE': {
        id: 'MERCHANT_OF_CABBAGE',
        rarityTable: merchantOfCabbageRarityTable,
    },
    // Future Folly Instruments would be added here...
};
