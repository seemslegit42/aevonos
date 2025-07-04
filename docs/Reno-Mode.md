# Reno Mode™: The Car Shame Neutralizer — Technical Specification

> “You dirty little minx… let’s get you glistening again.”

---

## 1. System Overview
Reno Mode™ is a chaotic-good lifestyle utility Micro-App designed to lovingly roast and rehabilitate a user’s messy car. It delivers a playful, cheeky, and brutally-honest-but-oddly-supportive assessment of a car’s interior, complete with a Dirtiness Score, flirty roasts, and recommended detail packages from an outrageous crew of “Filthmatch™” specialists.

This isn’t just cleaning advice—this is a glorious redemption arc for your car’s filth.

---

## 2. Core Components & Implementation
### 2.1. The `reno-mode-agent` (agents/reno-mode.ts)
The agent’s logic lives in the analyzeCarShame flow.
- **Tone**: Raunchy, but warm-hearted; snarky, but never cruel; like a bestie who knows your secrets but still hypes you up.

- **Input**: Photo of the car’s interior as photoDataUri.

- **Processing**: Multimodal LLM analyzes the image to produce:

  - `shameLevel`: A playful, NSFW-ish “Dirty Title” that feels like a badge of honor (e.g., “Gremlin Palace Royale”).

  - `rating`: Cleanliness score (0-100), delivered dramatically.

  - `roast`: Flirty, teasing one-liner roast—equal parts sass and seduction, aimed at the car and the owner.

  - `recommendedTier`: Suggestion for the most fitting detail package, framed like a guilty indulgence.

  - `weirdestObject`: A wild guess at the strangest visible object, adding surreal humor.

- **Output (`RenoModeAnalysisOutputSchema`)**: Structured JSON returning the full, affectionate roast and recommendations.

### 2.2. The `RenoMode` Micro-App (micro-apps/reno-mode.tsx)
- **UI**: is bright, playful, and dripping in neon-dive-bar charm.

- **Image Upload**: File input for car interior photo.

- **Analysis Trigger**: Button sends the image to the analyzeCarShame flow via BEEP.

- **Report Display**: Renders the full cheeky report—Shame Level, Rating, Roast, Recommended Tier, Weirdest Object—with dramatic flair.

- **Local Legends**: Lists fictional “Filthmatch™” detailing specialists, each with absurd bios and names like “The Upholstery Whisperer” or “Captain Vacuum.”

---

## 3. Integration with ΛΞVON OS
- **Invocation**: Launch via Canvas or BEEP commands like “Reno, it’s time to repent.”

- **Data Flow**: User uploads → Micro-App sends BEEP command → Agent analysis → Result flows back to the app via app-store → UI updates.

- **Billing**: Each analysis burns a billable `IMAGE_GENERATION` agent action (Obelisk Pay).

- **The Armory**: Premium Lifestyle Utility—available as a one-time purchase in The Armory, for users ready to lovingly reclaim their filthy rides.

---
✅ **Key Adjustments**:
- No cruel shaming—only consensual, playful filth.

- Roasts must feel like a wink, not a slap.

- Keeps her “dirtyness™,” but empowers it—like a filthy confessional you’re proud to enter.

---
🔥 **Sample Roast (for dev tuning)**:
"Wow, this car’s got more crumbs than a Netflix breakup scene. But hey—every queen needs her throne… even if it’s sticky."
