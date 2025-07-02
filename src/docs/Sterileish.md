# STERILE-ish™: The Compliance Vibe-Checker - Technical Specification

> "It's probably fine."

---

## 1. System Overview

STERILE-ish™ is a **specialized compliance analysis Micro-App** for regulated industries like medical device manufacturing. It embodies the persona of an irreverent, slightly sarcastic, but ultimately accurate AI that analyzes cleanroom logs.

It is designed to take the sterile, often tedious process of compliance review and inject a dose of humor while still providing valuable, at-a-glance analysis.

---

## 2. Core Components & Implementation

### 2.1. The `sterileish-agent` (`agents/sterileish.ts`)
The agent's logic is powered by the `analyzeCompliance` flow.
- **Persona-Driven Prompt**: The core prompt instructs the LLM to act as a "vibe checker for clean rooms," analyzing logs with a sarcastic but common-sense interpretation of ISO 13485 / FDA guidelines.
- **Input**: Accepts the `logText` and the `entryType` ('environment', 'calibration', 'cleaning', 'general').
- **Processing**: A single LLM call analyzes the log entry for specificity, date, and signature. It determines if the entry is "basically compliant," provides a snarky `complianceNotes`, assigns a numerical `sterileRating` (0-10), and generates a one-line `snarkySummary` suitable for an audit report header.
- **Output (`SterileishAnalysisOutputSchema`)**: Returns a structured JSON object with the full compliance analysis.

### 2.2. The `Sterileish` Micro-App (`micro-apps/sterileish.tsx`)
The UI is a clean, functional interface for log submission and review.
- **Inputs**: A `Textarea` for the log entry and a `Select` dropdown for the `entryType`.
- **Execution**: An "Analyze Log" button triggers the `analyzeComplianceLog` tool via a BEEP command.
- **Report Display**: After analysis, the UI displays the `sterileRating` on a `Progress` bar and shows the agent's full report in a series of `Alert` components, color-coded based on the compliance status.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or summoned via a BEEP command, e.g., "Ask STERILE-ish to check this cleaning log."
- **Agentic Control**: BEEP uses the `analyzeComplianceLog` tool to pass the log data to the agent.
- **Billing**: Each log analysis is a billable agent action, debited by Obelisk Pay.
- **The Armory**: As a niche but powerful tool for specific industries, STERILE-ish™ is listed in The Armory as a premium, one-time purchase.
