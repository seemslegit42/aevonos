# The Rolodex: Candidate Analyzer - Technical Specification

> "Efficiency in recruitment is not about finding the best person. It's about disqualifying the wrong ones faster."

---

## 1. System Overview

The Rolodex is a **specialized recruiting utility Micro-App**. It embodies the persona of a deadpan, efficient, and professional AI recruiting assistant. It is designed to analyze a candidate's summary against a job description, providing a quantitative fit score and generating useful outreach assets.

It is a tool for streamlining the top-of-funnel recruiting process, saving time and improving the quality of initial outreach.

---

## 2. Core Components & Implementation

### 2.1. The `rolodex-agent` (`agents/rolodex.ts`)
The agent's logic is powered by the `analyzeCandidate` flow.
- **Persona-Driven Prompt**: The core prompt instructs the LLM to act as a professional, deadpan recruiting assistant.
- **Input**: Accepts the `candidateName`, `candidateSummary` (e.g., from a resume or LinkedIn profile), and the `jobDescription`.
- **Processing**: A single LLM call analyzes the inputs to:
  1.  Generate a `fitScore` (0-100) based on the match between the summary and job description.
  2.  Generate a concise, non-cringey `icebreaker` for an outreach email, referencing a specific detail from the candidate's summary.
  3.  Write a new one-sentence `summary` of the candidate's key strength as it relates to the specific role.
- **Output (`RolodexAnalysisOutputSchema`)**: Returns a structured JSON object with the fit score, icebreaker, and summary.

### 2.2. The `TheRolodex` Micro-App (`micro-apps/rolodex.tsx`)
The UI is a tabbed interface that allows for analyzing both new and existing contacts.
- **New Candidate Tab**: Provides fields for a candidate's name and summary.
- **Analyze Contact Tab**: Fetches the user's existing contacts from the CRM and allows them to select one for analysis.
- **Shared Inputs**: Both tabs share a `Textarea` for the job description and an "Analyze Fit" button.
- **Execution**: The "Analyze Fit" button constructs the appropriate natural language command and passes it to the `handleCommandSubmit` function.
- **Result Display**: The UI displays the `fitScore` with a `Progress` bar, the AI-generated `summary`, and the `icebreaker` with a copy button.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Rolodex can be launched from the Canvas or via a BEEP command.
- **Agentic Control**: BEEP uses the `analyzeCandidate` tool to pass the candidate and job details to the agent.
- **CRM Integration**: The "Analyze Contact" tab directly queries the workspace's contacts via the `/api/contacts` endpoint, demonstrating seamless integration between Micro-Apps.
- **Billing**: Each candidate analysis is a billable agent action, debited by Obelisk Pay.
- **The Armory**: As a powerful utility for anyone involved in hiring, The Rolodex is listed in The Armory as a one-time purchase.
