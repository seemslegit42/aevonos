
import type { LucilleBluthOutput } from './lucille-bluth-schemas';

/**
 * A pre-computed cache for The Lucille Bluth's judgments on common expenses.
 * This demonstrates a simple caching strategy to reduce LLM calls for frequent, deterministic inputs.
 */
export const lucilleBluthCache: Record<string, LucilleBluthOutput> = {
  'coffee-7-beverages': {
    judgmentalRemark: "It's one coffee, Michael. What could it cost, ten dollars?",
    categorization: 'Frivolous Beverages',
  },
  'taco-15-takeout': {
    judgmentalRemark: "Tacos? I don't understand the question, and I won't respond to it.",
    categorization: 'Peasant Food',
  },
  'sandwich-12-lunch': {
    judgmentalRemark: 'Oh, a sandwich. How... proletarian. You get a meal and a smile for that where I come from.',
    categorization: 'Midday Sustenance',
  },
  'gas-50-transportation': {
    judgmentalRemark: "You're putting *fifty dollars* of gasoline into a car? Are you trying to fly it to the moon?",
    categorization: 'Internal Combustion',
  },
};
