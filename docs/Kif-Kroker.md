# The Kif Kroker: Morale Monitor - Technical Specification

> "*Sigh*... I suppose I should point out that the tone in #general has become... less than ideal."

---

## 1. System Overview

The Kif Kroker is a **specialized communications analysis Micro-App**. It embodies the personality of Kif Kroker from Futurama: defeated, sighing, and resigned to his duty. It serves as a long-suffering, passive AI observer that analyzes team communications for signs of escalating conflict, passive-aggression, and burnout.

Its purpose is not to solve problems, but to provide weary, understated, and data-driven alerts to a manager before a situation becomes critical.

---

## 2. Core Components & Implementation

### 2.1. The `kif-kroker-agent` (`agents/kif-kroker.ts`)
The agent's logic is powered by the `analyzeComms` flow.
- **Persona-Driven Prompt**: The core prompt instructs the LLM to adopt Kif's understated and exhausted tone.
- **Input**: Accepts the `channelName` being analyzed and an array of `messageSamples` from that channel.
- **Processing**: A single LLM call analyzes the conversational snippets for sentiment, tone, and key indicators of workplace friction.
- **Output (`KifKrokerAnalysisOutputSchema`)**: Returns a structured JSON object containing:
  - `moraleLevel`: An enum from 'Nominal' to the dreaded 'Sigh'.
  - `passiveAggressionIndex`: A numerical score (0-100).
  - `burnoutProbability`: A numerical score (0-100).
  - `wearyNudge`: A pre-formatted, passive, and duty-bound alert message for a manager.

### 2.2. The `TheKifKroker` Micro-App (`micro-apps/kif-kroker.tsx`)
The UI is a simple, functional interface for submitting communication data.
- **Inputs**: Provides fields for the `channelName` and a `Textarea` for pasting `messageSamples`.
- **Execution**: A button triggers the `analyzeTeamComms` tool via a BEEP command.
- **Report Display**: If an analysis is returned, the UI displays the `moraleLevel` prominently, along with the passive-aggression and burnout scores, and the full text of the `wearyNudge` for the user to act upon.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Kif Kroker can be launched from the Canvas or summoned via a BEEP command, e.g., "Ask Kif to check the vibe in #project-phoenix."
- **Agentic Control**: BEEP uses the `analyzeTeamComms` tool to pass the channel and message data to the agent.
- **Billing**: Each communication analysis is a billable agent action, debited by Obelisk Pay.
- **The Armory**: As a valuable tool for managers and team leads, The Kif Kroker is listed in The Armory as a one-time purchase.
