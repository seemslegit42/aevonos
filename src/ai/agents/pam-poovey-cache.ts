
import type { PamAudioOutput } from './pam-poovey-schemas';

/**
 * A pre-computed cache for Pam Poovey's rants.
 * This demonstrates a simple caching strategy to reduce LLM calls for frequent, deterministic inputs.
 * NOTE: The audio data URIs are placeholders. A real implementation would generate these once and store them.
 */
export const pamPooveyCache: Record<string, PamAudioOutput> = {
  onboarding: {
    script: "Alright, new meat. Welcome to the... place. Don't touch my stuff, don't look at me before I've had coffee, and for the love of god, the bear claws are mine. Any questions? Too bad.",
    audioDataUri: 'data:audio/wav;base64,PLACEHOLDER_FOR_ONBOARDING_AUDIO',
  },
  attendance_policy: {
    script: "The policy is, get your ass in the chair. Or don't. I'm not your mom. But if you're not here, you don't get paid. And you can't buy bear claws without money. See how that works?",
    audioDataUri: 'data:audio/wav;base64,PLACEHOLDER_FOR_ATTENDANCE_AUDIO',
  },
  firing_someone: {
    script: "So, yeah... we're letting you go. It's not you, it's... well, no, it's definitely you. Pack your crap. Try not to cry on the ficus. Security!",
    audioDataUri: 'data:audio/wav;base64,PLACEHOLDER_FOR_FIRING_AUDIO',
  },
};
