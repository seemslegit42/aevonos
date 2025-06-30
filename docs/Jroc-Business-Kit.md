# J-ROC'S LEGIT-AS-FRIG BUSINESS KIT™ - Technical Specification

> "It's all about supply and command, know'm sayin'?"

---

## 1. System Overview

J-ROC'S LEGIT-AS-FRIG BUSINESS KIT™ is a **generative branding Micro-App** for the aspiring entrepreneur with more hustle than Harvard. It embodies the personality of J-ROC from Trailer Park Boys to provide users with a "legit-as-frig" business name, tagline, and logo.

It is a tool of pure, unadulterated creative energy, designed to get a user's hustle off the ground with style and humor.

---

## 2. Core Components & Implementation

### 2.1. The `jroc-agent` (`agents/jroc.ts`)
The agent's logic is contained within the `generateBusinessKit` flow, which is a two-stage generative process.
- **Input**: Accepts the `businessType` and a desired `logoStyle` ('bling', 'chrome', or 'dank minimal').
- **Stage 1: Text Generation**: The first LLM call uses a prompt that fully embodies the J-ROC persona. It generates a hilarious but plausible `businessName`, a hard-as-frig `tagline`, and a vivid `logoDescription`, as if J-ROC himself were directing a music video.
- **Stage 2: Image Generation**: The `logoDescription` from Stage 1 is then passed to a second, image-generation LLM call (`gemini-2.0-flash-preview-image-generation`) to create the actual logo as a data URI.
- **Output (`JrocOutputSchema`)**: Returns a structured JSON object containing the business name, tagline, logo description, and the logo image data URI.

### 2.2. The `JrocBusinessKit` Micro-App (`micro-apps/jroc-business-kit.tsx`)
The UI is a straightforward interface for generating a business identity.
- **Inputs**: Provides fields for the user to enter their hustle (`businessType`) and select a `logoStyle`.
- **Execution**: A "Get It Legit" button triggers the `generateBusinessKit` tool via a BEEP command.
- **Display**: The UI prominently displays the generated `businessName` and `tagline`. The AI-generated logo is shown in a dedicated image viewer, with a fallback to display the text description if image generation fails.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "I need to get my new lawn care business legit."
- **Agentic Control**: BEEP uses the `generateBusinessKit` tool to pass the business type and style to the agent.
- **Billing**: The `generateBusinessKit` flow involves two distinct LLM calls (one for text, one for image generation) and is therefore billed as two Agent Actions by Obelisk Pay.
- **The Armory**: As a high-affinity, creative utility, the J-ROC Business Kit is listed in The Armory as a featured, one-time purchase.
