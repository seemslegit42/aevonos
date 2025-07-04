# Vandelay Industries: The Alibi Architect - Technical Specification

> "Importing, exporting, and ghosting."

---

## 1. System Overview

Vandelay Industries is a **productivity and lifestyle Micro-App**. It embodies the persona of a fake company specializing in "importing and exporting" to generate impeccably boring, jargon-filled calendar invites that serve as plausible alibis for users who need to block off their time.

It is a tool that weaponizes corporate nonsense for the noble cause of personal time management.

---

## 2. Core Components & Implementation

### 2.1. The `vandelay-agent` (`agents/vandelay.ts`)
The agent's logic is powered by the `createVandelayAlibi` flow.
- **Persona-Driven Prompt**: The core prompt instructs the LLM to act as an assistant for Vandelay Industries, using a mix of corporate buzzwords and vague concepts to generate a meeting title so dull that no one would ever question it.
- **Input**: Accepts an optional `topicHint` (e.g., "design review") and a boolean `addAttendees` flag.
- **Processing**: A single call to a Groq LPU generates a boring, jargon-filled meeting `title`. If `addAttendees` is true, it also generates a list of 2-3 plausible but fake attendees (e.g., external stakeholders, consultants) to increase the alibi's legitimacy.
- **Output (`VandelayAlibiOutputSchema`)**: Returns a structured JSON object with the generated title and optional attendees.

### 2.2. The `Vandelay` Micro-App (`micro-apps/vandelay.tsx`)
The UI is a simple control panel for generating alibis.
- **Inputs**:
  - An `Input` for the optional `topicHint`.
  - A `Switch` to toggle the `addAttendees` feature.
- **Execution**: A "Create Alibi" button constructs the appropriate natural language command and passes it to the central `handleCommandSubmit` function.
- **Result Display**: The UI displays the generated meeting `title` and `attendees` in an `Alert` component, with a button to copy the title to the clipboard for easy pasting into a calendar app.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "Vandelay, I need an hour."
- **Agentic Control**: BEEP uses the `createAlibi` tool to pass the topic hint and attendee flag to the agent.
- **Billing**: Each alibi generation is a billable agent action, debited by Obelisk Pay.
- **Monetization Hook**: The "Plausible Attendees" feature is presented as a premium add-on. The tooltip on the switch explains that it requires a higher plan tier, serving as an in-app upsell path.
- **The Armory**: Vandelay Industries is listed as a high-affinity lifestyle/utility app in The Armory.
