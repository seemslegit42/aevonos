
import type { VandelayAlibiOutput } from './vandelay-schemas';

/**
 * A pre-computed cache for common Vandelay Industries alibi requests.
 * This demonstrates a simple caching strategy to reduce LLM calls for frequent, deterministic inputs.
 * In a production system, this would be replaced by a proper external cache (e.g., Redis).
 */
export const vandelayCache: Record<string, VandelayAlibiOutput> = {
  'generic-false': {
    title: 'Synergy Deep Dive (Q3 Alignment)',
    attendees: [],
  },
  'generic-true': {
    title: 'Cross-Functional Touchpoint on Strategic Verticals',
    attendees: ['jen@synergyconsulting.io', 'Dr. Alistair Finch (Compliance)'],
  },
  'design review-false': {
    title: 'Async Design Review & Heuristics Alignment',
    attendees: [],
  },
  'design review-true': {
    title: 'Stakeholder Feedback Session: UI/UX Heuristics',
    attendees: ['susan.g@megacorp.com', 'Mark (Third-Party Vendor)'],
  },
  'urgent call-false': {
    title: 'Critical Path Debrief: Tactical Response Sync',
    attendees: [],
  },
};
