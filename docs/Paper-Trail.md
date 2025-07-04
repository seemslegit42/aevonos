# Paper Trail P.I.: The Informant - Technical Specification

> "The receipts don't lie. They just whisper."

---

## 1. System Overview

Paper Trail P.I. is a **specialized document analysis Micro-App** designed for expense management with the flair of a noir detective. It allows users to "file evidence" (receipts) and receive "leads" (categorization and analysis) from an AI informant.

This tool turns the mundane task of expense tracking into an engaging, narrative-driven investigation.

---

## 2. Core Components & Implementation

### 2.1. The `paper-trail-agent` (`agents/paper-trail.ts`)
The agent's intelligence is built into the `scanEvidenceFlow` Genkit prompt.
- **Input**: Accepts a `receiptPhotoUri` (a Base64 encoded image) and an optional `caseFile` name for context.
- **Multimodal Processing**: A multimodal LLM call analyzes the image of the receipt to extract the `vendor`, `amount`, and `date`. It also performs a validity check.
- **Narrative Generation**: The agent synthesizes the extracted data into a `lead`—a sharp, analytical note in a gritty, noir-detective style that suggests how to categorize the expense or what it implies.
- **Output (`PaperTrailScanOutputSchema`)**: Returns a structured JSON object containing the extracted data and the generated lead.

### 2.2. The `PaperTrail` Micro-App (`micro-apps/paper-trail.tsx`)
The UI is a thematic "case file" interface for submitting and reviewing evidence.
- **Evidence Upload**: A file input allows the user to upload a photo of their receipt.
- **Execution**: The app calls the `scanEvidence` server action directly (bypassing BEEP for file data efficiency), passing the image data URI.
- **Evidence Log**: The UI displays a running log of all successfully analyzed receipts for the current session, showing the vendor, amount, and the informant's lead.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "file this evidence."
- **Billing**: Each receipt scan is a billable `IMAGE_GENERATION` agent action, debited by Obelisk Pay.
- **The Armory**: As a unique utility for freelancers and small businesses, Paper Trail P.I. is available in The Armory as a one-time purchase.
