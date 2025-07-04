# Project Lumbergh: The Meeting Killer - Technical Specification

> "Yeeeeah, I'm gonna need you to go ahead and come in on Saturday."

---

## 1. System Overview

Project Lumbergh is a **productivity Micro-App** that embodies the persona of Bill Lumbergh from the movie *Office Space*. It is designed to analyze meeting invites for signs of pointlessness and generate perfectly passive-aggressive decline memos to help users reclaim their time.

It is a tool of corporate apathy, designed to undermine the soul-crushing culture of unnecessary meetings.

---

## 2. Core Components & Implementation

### 2.1. The `lumbergh-agent` (`agents/lumbergh.ts`)
The agent's logic is contained within the `analyzeInvite` flow.
- **Persona-Driven Prompt**: The core prompt is rich with Lumbergh's signature phrases ("Yeeeeah," "gonna need you to," "that'd be greeeeat") and instructs the LLM to analyze meeting invites for red flags like a lack of agenda, too many attendees, or vague buzzwords.
- **Input**: Accepts the full `inviteText` from a calendar event.
- **Processing**: A single call to a Groq LPU analyzes the invite text. If red flags are found, it sets `isFlagged` to true, generates a passive-aggressive `flagReason`, and drafts a list of 2-3 `declineMemos`. If the meeting seems fine, it returns a simple, unenthusiastic confirmation.
- **Output (`LumberghAnalysisOutputSchema`)**: Returns a structured JSON object with the analysis results.

### 2.2. The `ProjectLumbergh` Micro-App (`micro-apps/project-lumbergh.tsx`)
The UI is a simple, soul-crushing interface for meeting analysis.
- **Input**: A `Textarea` for the user to paste the meeting invite details.
- **Execution**: An "Analyze Invite" button triggers the `analyzeMeetingInvite` tool via a BEEP command.
- **Result Display**:
  - An `Alert` component displays whether the meeting was flagged and the reason why.
  - If flagged, it displays the generated `declineMemos`, each with a copy button for easy use.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "Ask Lumbergh to check this meeting."
- **Agentic Control**: BEEP uses the `analyzeMeetingInvite` tool to pass the invite text to the agent.
- **Billing**: Each meeting analysis is a billable agent action, debited by Obelisk Pay.
- **Monetization Hook**: The UI includes a disabled "Red Stapler Mode" switch. The tooltip explains that this premium feature (which auto-declines certain meetings) requires a plan upgrade, serving as an in-app upsell path.
- **The Armory**: Project Lumbergh is listed as a high-affinity lifestyle/utility app in The Armory.
