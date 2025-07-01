
'use server';

/**
 * @fileOverview Defines the baseline probability weights and boons for all Instruments of Folly.
 * This is the Abacus of Fates, the raw truth before the Sine-Rhythm Engine applies its modulations.
 */

export type Boon = {
    type: 'credits' | 'chaos_card' | 'system_effect';
    value: number | string; // Credit multiplier or card key or effect name
    weight: number;
}

export type OutcomeTier = {
    tier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'MYTHIC' | 'DIVINE';
    baseWeight: number;
    boons: Boon[];
    narrativeTriggers: string[];
}

export type FollyInstrumentConfig = {
    id: string;
    rarityTable: OutcomeTier[];
}

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
            { type: 'chaos_card', value: 'GEOLOGIC_TIME', weight: 10 },
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
        baseWeight: 1, // Reserved for forced events like pity boons
        boons: [
            { type: 'system_effect', value: 'SISYPHUS_REPRIEVE', weight: 50 },
            { type: 'system_effect', value: 'PSYCHE_MATRIX_RESONANCE', weight: 50 },
        ],
        narrativeTriggers: ["The gods take notice."],
    },
];

export const follyInstrumentsConfig: Record<string, FollyInstrumentConfig> = {
    'SISYPHUSS_ASCENT': {
        id: 'SISYPHUSS_ASCENT',
        rarityTable: sisyphusAscentRarityTable,
    },
    'ORACLE_OF_DELPHI_VALLEY': {
        id: 'ORACLE_OF_DELPHI_VALLEY',
        rarityTable: sisyphusAscentRarityTable, // Placeholder, should be unique
    },
    'MERCHANT_OF_CABBAGE': {
        id: 'MERCHANT_OF_CABBAGE',
        rarityTable: sisyphusAscentRarityTable, // Placeholder, should be unique
    },
    // Future Folly Instruments would be added here...
};
