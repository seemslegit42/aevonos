# The Orphean Oracle: Data Narrator - Technical Specification

> "I have descended into the underworld of your data. Here is the story I returned with."

---

## 1. System Overview

The Orphean Oracle is a **specialized data visualization Micro-App**. It embodies the persona of a mystical oracle who descends into the "data underworld" to translate raw business metrics into profound, metaphorical, visual narratives.

It is designed to replace sterile charts and graphs with a "data constellation"—an interactive 3D representation of a business's health, where the user can feel the story in the data, not just read it.

---

## 2. Core Components & Implementation

### 2.1. The `orphean-oracle-agent` (`agents/orphean-oracle-flow.ts`)
The agent's logic resides in the `invokeOracle` flow.
- **Persona-Driven Prompt**: The core prompt instructs the LLM to act as the Orphean Oracle, interpreting raw JSON data not as numbers, but as a story or myth.
- **Input**: Accepts a `userQuery` (e.g., "Tell me the story of my Q3 sales") and mock business data.
- **Processing**: A single call to a Groq LPU analyzes the user query and the mock data to generate:
  1.  A poetic, narrative `summary` of the data's meaning.
  2.  A list of clear, actionable `keyInsights`.
  3.  A `visualizationData` object containing the parameters (`nodes` and `connections`) for rendering the 3D data constellation. Node size, color, and pulse speed are determined by the LLM based on its interpretation of the data's importance and health.
- **Output (`OrpheanOracleOutputSchema`)**: Returns the full, structured JSON object containing the narrative and visualization parameters.

### 2.2. The `OrpheanOracle` Micro-App (`micro-apps/orphean-oracle.tsx`)
The UI is a container for the 3D visualization and the narrative summary.
- **3D Canvas**: A `react-three-fiber` canvas renders the `visualizationData` as an interactive 3D graph. Users can rotate and zoom to explore the data constellation.
- **Narrative Display**: The poetic `summary` and actionable `keyInsights` from the agent are displayed in `Alert` components below the visualization, providing context and meaning to the visual representation.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Oracle can be launched from the Canvas or summoned via a BEEP command like, "Show me the story of my Q3 sales."
- **Agentic Control**: BEEP uses the `invokeOrpheanOracle` tool to pass the user's query to the agent.
- **Billing**: Each consultation with the Oracle is a billable agent action, debited by Obelisk Pay.
- **The Armory**: The Orphean Oracle is positioned as a premium, high-value data visualization tool, available as a one-time purchase in The Armory.
