# The Rolodex: The Recruiting Engine - Technical Specification

> "It's not who you know. It's how fast you can analyze them."

---

## 1. System Overview

The Rolodex is a **specialized recruiting Micro-App** that analyzes candidate information against a job description to determine fit and generate outreach assets. It is designed to accelerate the top-of-funnel recruiting process.

This is not a full-fledged Applicant Tracking System (ATS). It is a high-speed analysis and generation tool for making first contact.

---

## 2. Core Components & Implementation

### 2.1. The `rolodex-agent` (`agents/rolodex.ts`)
The agent's logic is contained within the `rolodexAnalysisFlow`.
- **Input**: Accepts the `candidateName`, a `candidateSummary` (e.g., from a resume or LinkedIn profile), and the `jobDescription` for the role.
- **Processing**: A single LLM call compares the candidate's summary against the job description to:
  1.  Generate a `fitScore` from 0-100.
  2.  Write a concise, professional, and non-cringey `icebreaker` for an outreach email.
  3.  Create a one-sentence `summary` of the candidate's key strength for the role.
- **Output (`RolodexAnalysisOutputSchema`)**: Returns a structured JSON object with the full analysis.

### 2.2. The `Rolodex` Micro-App (`micro-apps/rolodex.tsx`)
The UI is a two-tabbed interface for analyzing new or existing contacts.
- **Input Forms**: The UI provides `Textarea` fields for the job description and new candidate summary. For existing contacts, it provides a `Select` dropdown populated from the CRM.
- **Execution**: An "Analyze Fit" button triggers the `analyzeCandidate` tool via a BEEP command, constructing the command based on the active tab (new vs. existing).
- **Result Display**: The UI dynamically renders the `fitScore` as a progress bar, the AI summary, and the outreach `icebreaker` with a copy button.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or by a BEEP command like, "analyze this candidate for the engineer role."
- **CRM Integration**: The "Analyze Contact" tab demonstrates integration with the CRM by fetching and using data from the `contact-list` store.
- **Billing**: Each analysis is a billable `SIMPLE_LLM` agent action, debited by Obelisk Pay.
- **The Armory**: The Rolodex is listed in The Armory as a premium utility for HR and recruiting teams.
