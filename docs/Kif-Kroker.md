
# The Kif Kroker: The Morale Monitor - Technical Specification

> "*Sigh*... The conflict metrics are escalating again. I should probably... inform someone."

---

## 1. System Overview

The Kif Kroker is a **specialized communications analysis Micro-App** that monitors team chat channels for signs of impending doom. Its personality is that of a long-suffering, passive, and duty-bound AI observer, designed to detect rising conflict, passive-aggression, and burnout.

This is not a simple sentiment analysis tool. It is a nuanced morale monitor that provides weary, understated alerts to managers before a situation becomes critical.

---

## 2. Core Components & Implementation

### 2.1. The `kif-kroker-agent` (`agents/kif-kroker.ts`)
The agent's logic is built into the `analyzeCommsFlow`.
- **Input**: Accepts a `channelId` for a public Slack channel.
- **Data Fetching**: The agent uses the `getSlackChannelMessages` tool to retrieve a sample of recent messages from the specified channel.
- **Processing**: A single LLM call analyzes the conversation for tone, keywords, and patterns. It calculates a `Passive-Aggression Index` and a `Burnout Probability`, determines an overall `moraleLevel`, and generates a short, tired, passive alert message (`wearyNudge`) for a manager.
- **Output (`KifKrokerAnalysisOutputSchema`)**: Returns a structured JSON object with the full analysis.

### 2.2. The `KifKroker` Micro-App (`micro-apps/kif-kroker.tsx`)
The UI is a minimalist "Atmospheric Monitor" for a selected channel.
- **Channel Input**: An `Input` field allows the manager to specify the Slack Channel ID to be analyzed.
- **Execution**: A "Scan Atmosphere" button triggers the `analyzeTeamComms` tool via a BEEP command.
- **Report Display**: The UI renders the full report, including the `MoraleDisplay`, the calculated index scores, and the `wearyNudge` alert.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "ask Kif to check the #project-phoenix channel."
- **Tool Use**: Demonstrates agentic tool use by calling the Slack API to fetch data before analysis.
- **Billing**: Each scan is a billable agent action, consuming credits for both the `EXTERNAL_API` call and the `SIMPLE_LLM` call, debited by Obelisk Pay.
- **The Armory**: As a high-value utility for managers and HR, The Kif Kroker is listed in The Armory as a one-time purchase.
