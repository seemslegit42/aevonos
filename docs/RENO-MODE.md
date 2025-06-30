# Reno Mode™: Technical Specification

> “You dirty, filthy beast... let’s make you purr again.”

---

## 1. System Overview

Reno Mode™ is a **chaotic-good lifestyle Micro-App** designed for the high-affinity user who embraces a mix of irreverence, utility, and dark humor. It is a prime example of a non-core, independently deployable utility within the ΛΞVON OS ecosystem.

It solves the real-world problem of car cleaning procrastination by transforming it from a chore into a shame-neutralizing, gamified side quest.

---

## 2. Core Components & Implementation

### 2.1. The `reno-mode` Agent (`agents/reno-mode.ts`)
The core intelligence of the app is powered by a dedicated Genkit agent.
- **`analyzeCarShame` Flow**: This is the primary agentic flow. It receives a `photoDataUri` of a car's interior and utilizes a multimodal LLM to perform image analysis.
- **Output (`RenoModeAnalysisOutput`)**: The agent returns a structured JSON object containing:
  - `shameLevel`: A hilarious, tiered rating of the car's filth.
  - `rating`: A numerical cleanliness score (0-100).
  - `roast`: A short, flirty, shaming roast of the car's state.
  - `recommendedTier`: A suggested detailing package.
  - `weirdestObject`: The AI's best guess for the most bizarre item found.

This flow is billable and consumes Agent Actions upon invocation.

### 2.2. The `RenoMode` Micro-App (`micro-apps/reno-mode.tsx`)
The UI is a self-contained React component that provides the full user experience.
- **Car Shame Index™**: An image uploader that captures a photo, converts it to a data URI, and sends it to the `analyzeCarShame` flow via a BEEP command.
- **Filthmatch™ Local Connector**: A UI module that displays a mock list of local detailers, each with a distinct personality, playlist, and "red flags." This is designed for high user affinity and humor.
- **Reno’s Guide to Dirty Pleasure**: A collapsible accordion component containing a step-by-step DIY car detailing guide written in Reno's unique, NSFW-tinged voice.
- **Sticker Collection**: A display area for earned "achievements" like "Crumb Daddy" or "Mildew Slayer," intended for future gamification.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: Reno Mode™ is launched like any other Micro-App from the Canvas, either manually or via a BEEP command.
- **Agentic Control**: BEEP can directly invoke the `analyzeCarShame` flow using the `reno-mode` tool. A user can type, "ask reno to analyze this car photo" and provide the image data.
- **The Armory**: The Micro-App is listed in The Armory as a featured, one-time purchase, contributing to the platform's ΞCredit economy.

Reno Mode™ exemplifies the ΛΞVON OS principle of building hyper-specific, personality-driven tools that deliver both utility and entertainment, creating a "sticky" user experience that is difficult to replicate.
