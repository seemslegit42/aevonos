
# Vandelay Industries: The Alibi Architect - Technical Specification

> "I'm an architect. We're an industrious people."

---

## 1. System Overview

Vandelay Industries is a **specialized productivity Micro-App** that generates impeccably boring, jargon-filled calendar invites to be used as plausible alibis for blocking off deep work time. It's a tool for "importing/exporting" focus.

This is not just a calendar tool; it's a creative solution for manufacturing uninterrupted time in a world of endless meetings.

---

## 2. Core Components & Implementation

### 2.1. The `vandelay-agent` (`agents/vandelay.ts`)
The agent's logic resides within the `generateAlibiFlow`.
- **Caching**: The agent uses a simple in-memory cache (`vandelay-cache.ts`) to store and retrieve previously generated alibis for common requests, reducing LLM calls and demonstrating a basic caching strategy.
- **Input**: Accepts an optional `topicHint` and a boolean `addAttendees` flag.
- **Processing**: A single LLM call crafts a profoundly dull meeting `title` using a mix of corporate buzzwords. If requested, it also generates a list of plausible but fake `attendees` to enhance legitimacy.
- **Output (`VandelayAlibiOutputSchema`)**: Returns a structured JSON object with the meeting title and optional attendees.

### 2.2. The `Vandelay` Micro-App (`micro-apps/vandelay.tsx`)
The UI is a simple console for generating alibis.
- **Options**: An `Input` for the topic hint and a `Switch` to toggle the inclusion of fake attendees.
- **Execution**: A "Create Alibi" button triggers the `createAlibi` tool via a BEEP command, passing the configured options.
- **Result Display**: The UI displays the generated meeting title and attendees in a clean `Alert` component, with a button to copy the title to the clipboard.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "I need an alibi for 2 hours" or "create a fake meeting about a design review."
- **Billing**: Each alibi generation is a billable `SIMPLE_LLM` agent action, debited by Obelisk Pay. Cache hits are still billed, as the value is in the result, not the computation.
- **The Armory**: As a popular productivity utility, Vandelay Industries is available in The Armory for a one-time purchase.
