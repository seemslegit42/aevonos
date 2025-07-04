# The Auditor Generalissimo™: Fiscal Discipline Daemon - Technical Specification

> "Welcome to your books, comrade. You are guilty until proven solvent."

---

## 1. System Overview

The Auditor Generalissimo™ is a **specialized financial analysis Micro-App** designed for users who appreciate fiscal discipline enforced with an iron fist. It combines the roles of a stern Soviet-era comptroller and a sentient, judgmental CFO to deliver financial insights through fear, sarcasm, and oppressive precision.

This is not a gentle budgeting tool. It is an agentic auditor that turns expense review into a tribunal.

---

## 2. Core Components & Implementation

### 2.1. The `auditor-generalissimo-agent` (`agents/auditor-generalissimo.ts`)
The agent's logic is encapsulated in the `auditFinances` flow, a powerful text and audio generation pipeline.
- **Input**: Accepts a string of financial transactions (e.g., from a CSV) and the workspace ID.
- **Processing**:
  1.  **Groq-Powered Analysis**: A primary call to a Groq LPU analyzes the transactions to generate a `financialHealthScore`, `burnRateDays`, a sarcastic `overallRoast`, and an `irsAuditSimulation`. It also tags each transaction with brutally honest `aiTags` and adds judgmental `warnings` where necessary.
  2.  **TTS Generation**: A second, parallel LLM call to a Text-to-Speech model (Gemini) converts the `overallRoast` into a deep, authoritative audio file, delivered as a data URI.
- **Output (`AuditorOutputSchema`)**: Returns a structured JSON object containing the full audit, including the audio URI.

### 2.2. The `AuditorGeneralissimo` Micro-App (`micro-apps/auditor-generalissimo.tsx`)
The UI is designed as a grim, quasi-military financial dashboard.
- **Transaction Input**: A `Textarea` allows the user to paste their financial data.
- **Audit Execution**: A button triggers the `auditFinances` agent flow via a BEEP command.
- **Report Display**: The UI renders the structured output from the agent, including the `HealthScoreDisplay`, the Auditor's roast (with a play button for the TTS audio), and a scrollable list of the audited transactions with their AI-generated tags and warnings.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "Summon the Auditor."
- **Agentic Control**: BEEP can directly use the `auditFinances` tool. A user can command: `audit my expenses: [paste data]`.
- **Billing**: The `auditFinances` flow is a high-value agentic process that consumes multiple Agent Actions, which are debited from the user's workspace balance by Obelisk Pay.
- **The Armory**: As a high-affinity utility, The Auditor Generalissimo™ is listed in The Armory as a featured, one-time purchase.
