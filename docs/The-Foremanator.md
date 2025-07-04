
# The Foremanator™: The Site Commander - Technical Specification

> "I don't have time for excuses. I have time for results. Get back to work."

---

## 1. System Overview

The Foremanator™ is a **specialized productivity Micro-App** designed for the construction and trades industries. It acts as a rugged, no-nonsense AI site commander that can take raw, voice-to-text daily logs from the field and instantly structure them into professional, actionable reports.

Its personality is that of a grizzled, perpetually unimpressed construction foreman who has seen it all and just wants the job done right.

---

## 2. Core Components & Implementation

### 2.1. The `foremanator-agent` (`agents/foremanator.ts`)
The agent's logic is encapsulated in the `processDailyLog` flow.
- **Input**: Accepts a raw, unstructured string of `logText` from the user.
- **Processing**: A single LLM call, prompted with The Foremanator's persona, parses the log to extract:
  - `tasksCompleted`: A clear, bulleted list of completed tasks.
  - `materialsUsed`: A list of materials consumed during the day.
  - `blockers`: Any identified issues or blockers preventing progress.
  - It also generates a concise `summary` of the day's activities and a short, motivational-but-insulting piece of `foremanatorCommentary`.
- **Output (`ForemanatorLogOutputSchema`)**: Returns a structured JSON object containing the full, processed report.

### 2.2. The `TheForemanator` Micro-App (`micro-apps/the-foremanator.tsx`)
The UI is a rugged, utilitarian interface designed for on-site use.
- **Log Input**: A large `Textarea` for pasting or typing daily logs, along with a prominent "Mic" button for (simulated) voice-to-text input.
- **Execution**: A "Submit Daily Log" button triggers the `logDailyReport` tool via a BEEP command.
- **Report Display**: The UI renders the structured report from the agent, clearly separating the summary, tasks, materials, blockers, and the Foremanator's final orders.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Foremanator™ can be launched from the Canvas or summoned by BEEP, e.g., "Foremanator, log this report..."
- **Billing**: Each log processing is a billable `SIMPLE_LLM` agent action, debited by Obelisk Pay.
- **The Armory**: As a high-value utility for trades and construction companies, The Foremanator™ is available as a premium, one-time purchase in The Armory.
