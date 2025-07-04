# Project Lumbergh: The Meeting Shredder - Technical Specification

> "Yeeeeah, I'm gonna need you to go ahead and justify this meeting's existence. That'd be greeeat."

---

## 1. System Overview

Project Lumbergh is a **satirical productivity Micro-App** that analyzes meeting invites for corporate anti-patterns and generates perfectly passive-aggressive decline memos. Its personality is that of Bill Lumbergh from Office Space, specializing in soul-crushing corporate apathy.

This is a tool for comedic relief and a commentary on modern corporate culture.

---

## 2. Core Components & Implementation

### 2.1. The `lumbergh-agent` (`agents/lumbergh.ts`)
The agent's logic is contained within the `analyzeInviteFlow`.
- **Input**: Accepts the `inviteText` of a calendar invitation.
- **Processing**: A single LLM call, prompted with Lumbergh's persona, scans the invite for red flags (no agenda, too many attendees, buzzwords). Based on its findings, it determines if the meeting `isFlagged`, provides a passive-aggressive `flagReason`, and generates 2-3 masterpiece `declineMemos`. If the meeting seems acceptable, it provides a simple, unenthusiastic confirmation.
- **Output (`LumberghAnalysisOutputSchema`)**: Returns a structured JSON object with the full analysis and decline memos.

### 2.2. The `ProjectLumbergh` Micro-App (`micro-apps/project-lumbergh.tsx`)
The UI is a simple, soul-crushing corporate interface.
- **Input**: A `Textarea` for pasting the meeting invite.
- **Execution**: An "Analyze Invite" button triggers the `analyzeMeetingInvite` tool via a BEEP command.
- **Report Display**: The UI displays the agent's verdict and, if the meeting is flagged, lists the generated decline memos with copy-to-clipboard buttons.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command.
- **Billing**: Each analysis is a billable `SIMPLE_LLM` agent action, debited by Obelisk Pay.
- **The Armory**: As a popular entertainment and productivity utility, Project Lumbergh is available in The Armory for a one-time purchase.
