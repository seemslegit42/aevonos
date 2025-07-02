# BEEP Wingman: The Closer - Technical Specification

> "He is not your assistant. He is your closer."

---

## 1. System Overview

The BEEP Wingman is a **specialized communication Micro-App** designed to help users navigate tricky social situations with precision and flair. It acts as a social engineer, a de-escalation savant, and a master of rhetoric, crafting the perfect message to achieve a user's goal while preserving their social capital.

It is a tool for high-stakes communication, transforming user intent into a perfectly calibrated message.

---

## 2. Core Components & Implementation

### 2.1. The `wingman-agent` (`agents/wingman.ts`)
The agent's intelligence is built into the `generateWingmanMessage` flow.
- **Mode-Driven Persona**: The agent uses a map of prompt instructions based on the user's selected `messageMode` (e.g., 'Cool & Collected', 'Charming AF', 'Help Me Say No'). This allows the agent to adopt the correct tone and strategy for the specific social context.
- **Input**: Accepts the `situationContext` and the desired `messageMode`.
- **Multi-layered Analysis**:
  1.  **Message Crafting**: Generates the single most effective message based on the persona and context.
  2.  **Cringe Detection Engine™**: Analyzes the generated message for common social faux pas (emotional overexposure, corporate cringe, etc.) and assigns a `cringeScore`.
  3.  **Regret Shield™**: Based on the cringe score and an assessment of emotional charge, determines if the message is too risky to send immediately, triggering a "cool-down" warning.
- **Output (`WingmanOutputSchema`)**: Returns a comprehensive analysis including the suggested message, cringe score, vibe assessment, and the status of the Regret Shield™.

### 2.2. The `BeepWingman` Micro-App (`micro-apps/beep-wingman.tsx`)
The UI is an interactive console for crafting and analyzing messages.
- **Briefing Section**: A `Textarea` for the user to describe the situation and a `Select` dropdown to choose the message mode.
- **Execution**: A "Deploy Charm" button that triggers the `generateWingmanMessage` tool via a BEEP command.
- **Results Panel**: Displays the full report from the agent, including the suggested message (with a copy button), the `CringeOMeterDial` to visualize the cringe score, and alerts for the vibe analysis and the Regret Shield™.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Wingman can be launched from the Canvas or via a BEEP command.
- **Agentic Control**: BEEP can directly use the `generateWingmanMessage` tool. For example: `ask wingman to help me say no to a last-minute project`.
- **Billing**: Every analysis is a billable agent action, debited by Obelisk Pay.
- **The Armory**: The Wingman is a high-affinity lifestyle utility, listed in The Armory as a featured, one-time purchase.
