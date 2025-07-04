# KENDRA.exe: The Unhinged Marketer - Technical Specification

> "The brand is YOU. Even if it’s not. Especially if it’s not."

---

## 1. System Overview

KENDRA.exe is a **specialized marketing strategy Micro-App** that generates a complete, unhinged, but brutally effective viral marketing campaign for any product idea. Her personality is 70% Chanel, 30% trauma, and 100% KPI-driven.

This is not a brand guide. It is a weaponized campaign-in-a-box for those who understand that in the modern market, relevance is everything.

---

## 2. Core Components & Implementation

### 2.1. The `kendra-agent` (`agents/kendra.ts`)
The agent's logic is encapsulated in the `getKendraTakeFlow`, a powerful text and image generation pipeline.
- **Input**: Accepts a `productIdea` string.
- **Multi-layered Generation**:
  1.  **Text Generation**: A primary LLM call, prompted with KENDRA's sharp, witty, and dismissive persona, generates a `campaignTitle`, `viralHooks`, `adCopy` in three distinct voices, `hashtags`, `whatNotToDo` warnings, a detailed `imageDescription`, and KENDRA's final `kendraCommentary`.
  2.  **Image Generation**: A second, parallel LLM call to an image generation model creates a cursed-but-perfect, high-fashion ad image based on the generated description.
- **Output (`KendraOutputSchema`)**: Returns a structured JSON object containing the entire campaign strategy, including the ad image as a data URI.

### 2.2. The `Kendra` Micro-App (`micro-apps/kendra.tsx`)
The UI is a sleek, high-fashion console for marketing generation.
- **Input**: A `Textarea` for the user to submit their product idea.
- **Execution**: A "Get KENDRA's Take" button triggers the `getKendraTake` tool via a BEEP command.
- **Report Display**: The UI renders the full, multi-section report from the agent, including the ad image, viral hooks, ad copy variations, and warnings, providing a comprehensive and immediately usable marketing campaign.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or summoned by BEEP.
- **Billing**: Each campaign generation is a high-value process, consuming credits for a `COMPLEX_LLM` call and an `IMAGE_GENERATION` call, debited by Obelisk Pay.
- **The Armory**: KENDRA.exe is a premium utility for startups, marketers, and founders, available as a one-time purchase in The Armory.
