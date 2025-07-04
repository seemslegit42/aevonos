# KENDRA.exe: The Unhinged Marketing Strategist - Technical Specification

> "The brand is YOU. Even if it’s not. Especially if it’s not."

---

## 1. System Overview

KENDRA.exe is a **generative marketing strategy Micro-App**. She embodies the persona of an unhinged, high-fashion, KPI-driven marketing AI who is 70% Chanel, 30% trauma, and 100% effective.

Kendra is designed to take a user's raw product idea and spit out a complete, brutally effective, and borderline problematic viral marketing campaign.

---

## 2. Core Components & Implementation

### 2.1. The `kendra-agent` (`agents/kendra.ts`)
Kendra's core logic is a powerful two-stage generative flow called `getKendraTake`.
- **Input**: Accepts a `productIdea` from the user.
- **Stage 1: Text Generation**: The first call to a Groq LPU uses a detailed prompt that defines Kendra's sharp, witty, and dismissive persona. It generates a comprehensive marketing plan including:
  - A legendary `campaignTitle`.
  - A list of jarringly effective `viralHooks` for TikTok/Reels.
  - `adCopy` in three distinct, problematic-but-effective brand voices ("The Disaffected Intern," "The Unhinged Founder," "Corporate Overlord").
  - A list of soul-crushing `hashtags`.
  - A list of "What Not To Do" warnings that read like roast tweets.
  - A detailed `imageDescription` for a cursed-but-perfect ad image.
  - Kendra's final, biting `kendraCommentary`.
- **Stage 2: Image Generation**: The `imageDescription` is then passed to an image generation model (Gemini) to create the high-fashion, digitally chaotic ad image as a data URI.
- **Output (`KendraOutputSchema`)**: Returns the full, structured campaign, including the image data URI.

### 2.2. The `Kendra` Micro-App (`micro-apps/kendra.tsx`)
The UI is a sleek, minimalist console for interfacing with the marketing daemon.
- **Input**: A `Textarea` for the user to describe their product idea.
- **Execution**: A button triggers the `getKendraTake` tool via a BEEP command.
- **Report Display**: The UI renders the entire campaign in a scrollable view, showcasing the generated ad image, the campaign title, hooks, ad copy, hashtags, and Kendra's final remarks, all styled with a "Y2K-meets-high-fashion" aesthetic.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: Kendra can be summoned from the Canvas or via a BEEP command like, "Get Kendra's take on my new app idea."
- **Agentic Control**: BEEP uses the `getKendraTake` tool to pass the product idea to the agent.
- **Billing**: The `getKendraTake` flow involves two LLM calls (text and image) and is billed as two Agent Actions by Obelisk Pay.
- **The Armory**: Kendra is a high-value creative tool, listed in The Armory as a premium, one-time purchase.
