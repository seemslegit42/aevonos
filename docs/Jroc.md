# J-ROC'S LEGIT-AS-FRIG BUSINESS KIT™: The Hustle Launcher - Technical Specification

> "It could happen to you, 'cause it happened to me. And T."

---

## 1. System Overview

J-ROC'S LEGIT-AS-FRIG BUSINESS KIT™ is a **lifestyle and entertainment Micro-App** that generates a complete branding package for a new "hustle," delivered in the iconic voice of J-ROC from Trailer Park Boys.

This is a creative tool designed for fun, engagement, and generating hilarious but plausible business concepts.

---

## 2. Core Components & Implementation

### 2.1. The `jroc-agent` (`agents/jroc.ts`)
The agent's logic is built into the `generateBusinessKitFlow`, a two-step generative pipeline.
- **Caching**: The agent uses a simple in-memory cache to store generated kits for 15 minutes, preventing duplicate LLM calls for the same request.
- **Input**: Accepts a `businessType` and a `logoStyle` ('bling', 'chrome', 'dank minimal').
- **Processing**:
  1.  **Text Generation**: A primary LLM call, prompted to act as J-ROC, generates a hilarious but plausible `businessName`, `tagline`, and a vivid `logoDescription`.
  2.  **Image Generation**: A second, parallel LLM call to an image generation model creates a vector-style logo based on the generated description and style.
- **Output (`JrocOutputSchema`)**: Returns a structured JSON object containing the full business kit, including the logo as a data URI.

### 2.2. The `JrocBusinessKit` Micro-App (`micro-apps/jroc-business-kit.tsx`)
The UI is a simple, thematic console for generating business ideas.
- **Input Form**: `Input` for the business type and a `Select` dropdown for the logo style.
- **Execution**: A "Get It Legit" button triggers the `generateBusinessKit` tool via a BEEP command.
- **Result Display**: The UI renders the full kit inside a mock "biz card," displaying the generated name, tagline, and the AI-generated logo.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command.
- **Billing**: Each kit generation is a high-value process, consuming credits for both a `SIMPLE_LLM` call and an `IMAGE_GENERATION` call, debited by Obelisk Pay.
- **The Armory**: As a featured entertainment utility, the Business Kit is available in The Armory for a one-time purchase.
