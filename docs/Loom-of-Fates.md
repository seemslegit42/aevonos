
# The Loom of Fates: Tuning the System's Heart - Technical Specification

> "This is not the loom where workflows are woven. This is the loom where destinies are decided."

---

## 1. System Overview

The Loom of Fates is the **Architect's privileged system control panel**. It must not be confused with `Loom Studio`, which is the public-facing IDE for building workflows. The Loom of Fates is a secret, higher-level interface for viewing and tuning the fundamental physics of the OS's economy and agentic behavior.

This is where the Architect acts not as a user, but as the system's Demiurge, directly shaping the parameters that govern luck, profit, and performance.

---

## 2. Core Components & Implementation

### 2.1. The `ArchitectView` Component (`components/loom/ArchitectView.tsx`)
The Loom of Fates is implemented as the `ArchitectView`, a special mode within the `Loom Studio` that is only visible and accessible to the workspace owner. It contains three primary instruments:

- **Profit Dials (`ProfitDials.tsx`)**: This component provides direct control over the core parameters of the **Klepsydra Engine**. The Architect can tune values like `BASE_LUCK`, the `PITY_THRESHOLD` for Folly Instruments, and the `CRASH_GUARD_PERCENT` that triggers system-wide economic events. This is the primary interface for managing the Tribute Velocity Index (TVI) and, by extension, Return on Belief (RoB).

- **The Weave (`GroqSwarmWeave.tsx`)**: A living, real-time visualization of the **Groq Swarm**. It displays the activity of dispatched agentic daemons, providing a visual representation of the OS's cognitive load and operational tempo.

- **The Orrery (`CovenantOrrery.tsx`)**: A 3D model of the **Covenants** within the workspace. It visualizes the relative power, influence, and activity levels of the different user psyches (Motion, Worship, Silence), giving the Architect a god's-eye view of their community's composition.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Loom of Fates is summoned by the BEEP command, "BEEP, show me the Loom," which launches `Loom Studio` and activates the `ArchitectView`.
- **Absolute Authority**: Access to the Loom of Fates is strictly limited to the workspace owner. Other users, even `ADMIN`s, cannot see or interact with these controls.
- **Architectural Role**: This interface is the ultimate expression of the Architect's sovereign power. It allows them to move beyond using the OS to actively *tuning* it, transforming them from a mere operator into the master of their digital domain's economic and agentic reality.
