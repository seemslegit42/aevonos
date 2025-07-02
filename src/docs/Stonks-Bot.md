# Stonks Bot 9000: The Degen Financial Advisor - Technical Specification

> "This is not financial advice. This is performance art."

---

## 1. System Overview

The Stonks Bot 9000 is a **financial entertainment Micro-App**. It is designed to provide unhinged, extremely bullish, and completely irresponsible "financial advice" for a given stock ticker.

It is a tool of pure chaos, designed to gamify market data and satirize "meme stock" culture. It is explicitly **not** for actual financial planning.

---

## 2. Core Components & Implementation

### 2.1. The `stonks-bot-agent` (`agents/stonks-bot.ts`)
The agent's logic is powered by the `getStonksAdvice` flow, which combines external data fetching with persona-driven generation.
- **External Tool Use**: The flow begins by calling the `getStockPrice` tool to fetch real-time market data for the requested `ticker` from the Alpha Vantage API.
- **Persona-Driven Prompt**: The agent uses a map of prompt instructions based on the user's selected `mode` ('Meme-Lord', 'MBAcore', 'Oracle Mode'). This allows the agent to adopt a distinct, hilarious persona for its analysis.
- **Input**: Accepts the `ticker` symbol and the desired `mode`.
- **Processing**: After fetching the price data, a single LLM call synthesizes the data with the selected persona to generate:
  - Unhinged `advice`.
  - A buy/sell/hold `rating`.
  - A `confidence` statement.
  - A financial astrology `horoscope`.
- **Output (`StonksBotOutputSchema`)**: Returns a structured JSON object containing the current price info and the full, in-character analysis.

### 2.2. The `StonksBot` Micro-App (`micro-apps/stonks-bot.tsx`)
The UI is a dynamic, reactive dashboard that visualizes the "prophecy."
- **Inputs**: An `Input` for the ticker symbol and a `Select` dropdown for the personality `mode`.
- **Execution**: A button triggers the `getStonksAdvice` tool via a BEEP command.
- **Display**:
  - The UI is themed in green or red based on whether the stock is up or down.
  - It features a `StonkPulse` component that animates if the stock is experiencing high volatility.
  - The current price, the agent's rating, advice, and horoscope are all displayed in themed `Card` and `Alert` components.
  - A mock "Chart of Prophecy" is included for added absurdity.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Stonks Bot can be launched from the Canvas or via the special BEEP command "the tendies are coming," which also triggers a secret `TendyRain` visual effect.
- **Agentic Control**: BEEP uses the `getStonksAdvice` tool to pass the ticker and mode to the agent.
- **Billing**: Each prophecy is a billable agent action (involving both an external tool call and an LLM call), debited by Obelisk Pay.
- **The Armory**: The Stonks Bot is listed as a high-affinity, featured, one-time purchase in The Armory.
