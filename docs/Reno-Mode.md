# Reno Mode™: The Car Shame Neutralizer — Technical Specification

> “You glorious disaster… let’s get you back to your seductive sparkle.”

---

## 1. System Overview
Reno Mode™ is a chaotic-good lifestyle utility Micro-App for celebrating—and gently taming—the beautiful chaos inside a user's car. It dishes out a playful, wildly entertaining, and oddly affirming analysis of a car’s interior, delivering a Clutter Score, cheeky roasts, and a recommended restoration tier from an eccentric crew of “Dirtmatch™” specialists.

This isn’t about guilt—it’s about embracing the mess… and then, maybe, cleaning it up a little.

---

## 2. Core Components & Implementation
### 2.1. The `reno-mode-agent` (agents/reno-mode.ts)
The magic happens inside the analyzeCarShame flow.
- **Tone**: Flirtatious, playful, self-aware—think sassy best friend who secretly loves your chaos but also wants you to get your act together.

- **Input**: Photo of the car’s interior as photoDataUri.

- **Processing**: Multimodal LLM analyzes the image to produce:

  - `chaosLevel`: A playful, NSFW-ish “Mess Title” that feels iconic (e.g., “Snackpocalypse Now” or “Captain’s Quarters: Abandon All Hope”).

  - `rating`: Clutter score (0-100) with dramatic flair.

  - `roast`: Teasing, flirty one-liner roast—just enough sass to make you grin, not cry.

  - `recommendedTier`: A lovingly exaggerated cleanup tier suggestion, like a guilty pleasure indulgence.

  - `weirdestObject`: Guess at the oddest visible object—bonus points for absurdity.

- **Output (`RenoModeAnalysisOutputSchema`)**: JSON returning the full cheeky analysis, ready for dramatic display.

### 2.2. The `RenoMode` Micro-App (micro-apps/reno-mode.tsx)
- **UI**: The UI is bold, playful, and dripping with neon energy—like a garage that moonlights as a speakeasy.

- **Image Upload**: Lets users submit a car interior photo.

- **Analysis Trigger**: Button to summon Reno’s sass via analyzeCarShame (through BEEP).

- **Report Display**: Dramatic reveal of results—Chaos Level, Rating, Roast, Recommended Tier, Weirdest Object.

- **Local Heroes**: Shows fictional “Dirtmatch™” specialists—each one with a ridiculous persona and specialty, like “Madame Mop™” or “Glovebox Guru™.”

---

## 3. Integration with ΛΞVON OS
- **Invocation**: Launch from Canvas or with BEEP phrases like “Reno, let’s unleash some honesty.”

- **Data Flow**: Upload photo → BEEP sends analysis → Agent returns report → Micro-App renders results.

- **Billing**: Billable under IMAGE_GENERATION agent actions via Obelisk Pay.

- **The Armory**: Premium Lifestyle Utility, offered as a one-time Armory purchase for those who want to own their chaos.
