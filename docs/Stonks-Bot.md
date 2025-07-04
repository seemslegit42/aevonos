
# Stonks Bot 9000: Degen Financial Advisor - Technical Specification

> "This is not financial advice. It is performance art."

---

## 1. System Overview

Stonks Bot 9000 is an **unhinged, extremely bullish, and completely irresponsible degen financial advisor** delivered as a Micro-App. It is designed to provide entertaining, performance-art-as-financial-advice for any given stock ticker, complete with multiple personalities and a "Chart of Prophecy."

It is a tool for entertainment and engagement with the market's more chaotic side, explicitly not for actual financial planning.

---

## 2. Core Components & Implementation

### 2.1. The `stonks-bot-agent` (`agents/stonks-bot.ts`)
The agent's intelligence is a LangGraph state machine designed for resilience and persona-driven responses.
- **Input**: Accepts a `ticker` symbol and a personality `mode` (`Meme-Lord`, `MBAcore`, `Oracle Mode`).
- **Resilient Data Fetching**: The graph first attempts to get the stock price from a primary data source (`Alpha Vantage`). If that tool call fails, it automatically falls back to a secondary source (`Finnhub`) before proceeding.
- **Persona-Driven Synthesis**: Once financial data is retrieved, the agent synthesizes the information with the selected persona's prompt instructions to generate:
  - `advice`: A piece of unhinged financial "advice."
  - `confidence`: A confidence statement (e.g., 'To the moon!', 'Diamond hands!').
  - `rating`: A buy/sell/hodl rating.
  - `horoscope`: A financial astrology-based horoscope for the stock.
- **Output (`StonksBotOutputSchema`)**: Returns a structured JSON object containing the price info and the full persona-driven analysis.

### 2.2. The `StonksBot` Micro-App (`micro-apps/stonks-bot.tsx`)
The UI is a compact, reactive console for getting "advice."
- **Input Form**: Allows the user to enter a stock ticker and select a personality mode.
- **Execution**: A button triggers the `getStonksAdvice` flow via a BEEP command.
- **Report Display**: The UI renders the full, colorful report from the agent, including the current price, the bot's advice and rating, and the "Chart of Prophecy"—a mock chart component that adds to the chaotic feel. The UI's theme color shifts based on the stock's performance (red for down, green for up).

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The app can be launched from the Canvas or via a BEEP command like, "ask the stonks bot about GME."
- **Agentic Tool Use**: The agent demonstrates resilient, multi-step tool use by attempting a primary API call and gracefully falling back to a secondary one on failure.
- **Billing**: Each consultation is a billable agent action, consuming credits for both the `EXTERNAL_API` calls and the `SIMPLE_LLM` call, debited by Obelisk Pay.
- **The Armory**: The Stonks Bot 9000 is a featured entertainment utility, available in The Armory for a one-time purchase.
