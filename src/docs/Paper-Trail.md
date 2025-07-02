# Paper Trail P.I.: The Expense Informant - Technical Specification

> "The city's full of stories. My job is to read the receipts."

---

## 1. System Overview

Paper Trail P.I. is a **specialized financial data entry Micro-App** with a noir detective theme. It allows users to submit photos of receipts ("evidence") and uses a multimodal AI agent to extract key information and provide an analytical "lead" on the expense.

It transforms the mundane task of expense tracking into an interactive, narrative-driven investigation.

---

## 2. Core Components & Implementation

### 2.1. The `paper-trail-agent` (`agents/paper-trail.ts`)
The agent's logic is powered by the `scanEvidence` flow, which uses a multimodal prompt.
- **Persona-Driven Prompt**: The core prompt instructs the LLM to act as an "AI Informant" in a noir detective agency, analyzing evidence and providing leads.
- **Input**: Accepts a `receiptPhotoUri` (a base64-encoded image of a receipt) and an optional `caseFile` name for context.
- **Processing**: A single call to a multimodal LLM analyzes the image to extract the `vendor` name, total `amount`, and `date`. It also generates a sharp, analytical `lead` about the expense (e.g., how to categorize it, what it implies for a case).
- **Output (`PaperTrailScanOutputSchema`)**: Returns a structured JSON object with the extracted data, the generated lead, and a boolean `isEvidenceValid` flag.

### 2.2. The `PaperTrail` Micro-App (`micro-apps/paper-trail.tsx`)
The UI is styled to look like a gritty detective's case file.
- **Evidence Uploader**: A file input allows the user to select an image, which is then converted to a data URI for preview and submission.
- **Execution**: A "File It" button triggers the `scanEvidence` server action, which is a dedicated wrapper around the agent flow suitable for handling file data.
- **Evidence Log**: The UI maintains a client-side log of successfully scanned receipts, displaying each as an `Alert` component showing the vendor, amount, date, and the informant's lead.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Paper Trail P.I. app is launched from the Canvas.
- **Agentic Control**: While the primary interaction is visual due to the image upload requirement, BEEP can still theoretically trigger the agent if a data URI is provided in the command context.
- **Billing**: Each receipt scan is a billable agent action involving a vision model, and is debited by Obelisk Pay.
- **The Armory**: As a unique and useful financial tool, Paper Trail P.I. is listed in The Armory as a one-time purchase.
