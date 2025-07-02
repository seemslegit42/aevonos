# The Foremanator™: AI Site Commander - Technical Specification

> "He doesn't sleep. He doesn't eat. He just processes daily logs."

---

## 1. System Overview

The Foremanator™ is a **specialized data processing Micro-App** for the construction and trades industries. It embodies the persona of a grizzled, no-nonsense construction foreman who has seen it all and is perpetually unimpressed.

It is designed to take raw, unstructured daily logs (often from voice-to-text) and parse them into a structured, professional report, saving time and improving data quality.

---

## 2. Core Components & Implementation

### 2.1. The `foremanator-agent` (`agents/foremanator.ts`)
The agent's logic is powered by the `processDailyLog` flow.
- **Persona-Driven Prompt**: The core prompt instructs the LLM to adopt The Foremanator's tough, direct, and hard-nosed persona.
- **Input**: Accepts the raw `logText` from a site worker's daily report.
- **Processing**: A single LLM call parses the unstructured text to extract key information:
  - A concise `summary` of the day's activities.
  - A list of `tasksCompleted`.
  - A list of `materialsUsed`.
  - A list of any `blockers` or issues encountered.
  - A motivational, but insulting, `foremanatorCommentary`.
- **Output (`ForemanatorLogOutputSchema`)**: Returns a structured JSON object with the parsed report and commentary.

### 2.2. The `TheForemanator` Micro-App (`micro-apps/the-foremanator.tsx`)
The UI is a simple, rugged interface for submitting and viewing site logs.
- **Input**: A `Textarea` for pasting the raw log entry, with a "Voice Input" button placeholder.
- **Execution**: A "Submit Daily Log" button triggers the `logDailyReport` tool via a BEEP command.
- **Report Display**: The UI displays the full, structured report from the agent, with clear sections for the summary, completed tasks, materials, blockers, and The Foremanator's final orders.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Foremanator can be launched from the Canvas or via a BEEP command like, "Log daily report for the east slab pour."
- **Agentic Control**: BEEP uses the `logDailyReport` tool to pass the raw log text to the agent for processing.
- **Billing**: Each log processing is a billable agent action, debited by Obelisk Pay.
- **The Armory**: As a powerful utility for a specific vertical (construction/trades), The Foremanator is listed in The Armory as a one-time purchase.
