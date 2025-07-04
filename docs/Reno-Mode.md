
# Reno Mode™: The Car Shame Neutralizer - Technical Specification

> "You dirty, filthy beast... let’s make you purr again.”

---

## 1. System Overview

Reno Mode™ is a **chaotic-good lifestyle utility Micro-App** designed for shame-neutralizing a user's messy car. It provides a hilarious, flirty, and brutally honest assessment of a car's interior, complete with a filth rating and a recommended detailing package from a cast of colorful "Filthmatch™" specialists.

This is not a simple utility; it is an experience designed to make a mundane task entertaining and engaging.

---

## 2. Core Components & Implementation

### 2.1. The `reno-mode-agent` (`agents/reno-mode.ts`)
The agent's logic is contained within the `analyzeCarShame` flow.
- **Input**: Accepts a photo of a messy car interior as a `photoDataUri`.
- **Processing**: A multimodal LLM call analyzes the image to generate:
  - `shameLevel`: A hilarious, NSFW-tinged but accurate rating of the car's filth level (e.g., 'Certified Gremlin Nest').
  - `rating`: A numerical cleanliness score from 0 to 100.
  - `roast`: A short, funny, slightly flirty roast of the car's current state.
  - `recommendedTier`: The recommended detailing package based on the filth level.
  - `weirdestObject`: A guess at the most bizarre object visible in the car.
- **Output (`RenoModeAnalysisOutputSchema`)**: Returns a structured JSON object containing the full, humorous analysis.

### 2.2. The `RenoMode` Micro-App (`micro-apps/reno-mode.tsx`)
The UI is a simple, vibrant interface for getting a car "analyzed."
- **Image Upload**: A file input allows the user to upload a photo of their car's interior.
- **Analysis Trigger**: A button invokes the `analyzeCarShame` flow via a BEEP command.
- **Report Display**: The UI dynamically renders the full report from the agent, including the Shame Level, rating, roast, recommended tier, and a list of mock local "Filthmatch™" specialists.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like "time for reno mode."
- **Data Flow**: User uploads photo in the Micro-App -> the app constructs a BEEP command with the image data URI -> BEEP invokes the `analyzeCarShame` tool -> the result is passed back to the `app-store` -> the `RenoMode` app's props are updated with the result.
- **Billing**: Each analysis is a billable `IMAGE_GENERATION` agent action, debited by Obelisk Pay.
- **The Armory**: Reno Mode™ is a featured lifestyle utility, available in The Armory for a one-time purchase.
