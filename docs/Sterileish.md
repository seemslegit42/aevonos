
# STERILE-ish™: The Compliance Vibe-Checker - Technical Specification

> "It's probably fine. Just... sign here and don't look too closely."

---

## 1. System Overview

STERILE-ish™ is a **specialized compliance Micro-App** for the medical device and life sciences industries. It analyzes cleanroom and manufacturing logs with an irreverent, sarcastic, but ultimately accurate eye for "good enough" compliance based on common-sense interpretations of standards like ISO 13485.

This is not a legal tool. It's a vibe-checker for clean rooms, designed for teams who need to be compliant but hate the paperwork.

---

## 2. Core Components & Implementation

### 2.1. The `sterileish-agent` (`agents/sterileish.ts`)
The agent's logic is contained within the `analyzeComplianceFlow`.
- **Input**: Accepts `logText` and the `entryType` ('environment', 'calibration', 'cleaning', 'general').
- **Processing**: A single LLM call analyzes the log for specificity, dates, and signatures. It determines if the entry is `isCompliant` (i.e., "basically compliant"), provides `complianceNotes`, calculates a `sterileRating` (0-10), and generates a `snarkySummary` for a hypothetical audit report.
- **Output (`SterileishAnalysisOutputSchema`)**: Returns a structured JSON object with the full, sarcastic analysis.

### 2.2. The `Sterileish` Micro-App (`micro-apps/sterileish.tsx`)
The UI is a clean, lab-like interface for log submission and review.
- **Log Input**: A `Textarea` for the log entry and a `Select` dropdown for the entry type.
- **Execution**: An "Analyze Log" button triggers the `analyzeComplianceLog` tool via a BEEP command.
- **Report Display**: The UI displays the compliance status, notes, the `SterileRating` as a progress bar, and the final snarky summary. It also features a mock "Audit Mode" switch for entertainment.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command.
- **Billing**: Each log analysis is a billable `SIMPLE_LLM` agent action, debited by Obelisk Pay.
- **The Armory**: As a niche but valuable utility for regulated industries, STERILE-ish™ is available as a one-time purchase in The Armory.
