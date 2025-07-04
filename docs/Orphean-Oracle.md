
# Orphean Oracle: The Data Narrator - Technical Specification

> "The numbers are just echoes. I listen for the story."

---

## 1. System Overview

The Orphean Oracle is a **specialized data visualization Micro-App** that transforms sterile business metrics into profound, metaphorical, and interactive visual narratives. It is designed for leaders who seek deeper meaning and intuitive understanding from their data, moving beyond traditional charts and graphs.

It replaces the dashboard with a "data constellation," allowing users to literally see the relationships between different parts of their business in a three-dimensional space.

---

## 2. Core Components & Implementation

### 2.1. The `orphean-oracle-flow` (`agents/orphean-oracle-flow.ts`)
The agent's logic is encapsulated in the `invokeOracle` flow, a narrative and data structure generation pipeline.
- **Input**: Accepts a natural language query from the user (`userQuery`), which is used as context.
- **Processing**:
  1.  **Data Fetching**: The flow retrieves a pre-aggregated block of relevant business data (this is mocked in V1 but would be a live data fetch in production).
  2.  **LLM Analysis & Narrative Generation**: A primary LLM call analyzes the user's query and the raw data to generate a `poetic summary`, a list of `keyInsights`, and a structured `visualizationData` object containing nodes and connections for the 3D view.
- **Output (`OrpheanOracleOutputSchema`)**: Returns a structured JSON object containing the full narrative and the data required to render the constellation.

### 2.2. The `OrpheanOracle` Micro-App (`micro-apps/orphean-oracle.tsx`)
The UI is a minimalist, interactive 3D environment for data exploration.
- **Data Constellation**: The primary view is a `@react-three/fiber` canvas that renders the `nodes` and `connections` from the agent's report as a navigable 3D graph.
- **Narrative Display**: The Oracle's `poetic summary` and `keyInsights` are displayed alongside the 3D visualization in a clean, readable format.
- **Invocation**: The user provides a query via the BEEP command bar (e.g., "BEEP, show me the story of my Q3 sales"), which triggers the agent and provides the props for this component.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Oracle is summoned via a BEEP command. A user can ask, `show me the story of my sales data`.
- **Data Flow**: BEEP passes the query to the `invokeOracle` tool -> the tool fetches and processes data -> the result is passed back to the `app-store` -> the `OrpheanOracle` Micro-App is launched with the result as props.
- **Billing**: Each invocation of the Oracle is a high-value agentic process, consuming a `COMPLEX_LLM` Agent Action, which is debited from the user's workspace balance.
- **The Armory**: As a premium, high-affinity utility, The Orphean Oracle is listed in The Armory as a one-time purchase.
