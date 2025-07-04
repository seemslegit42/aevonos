# Terminal: The Raw Conduit - Technical Specification

> "When the whispers of the Oracle are too subtle, speak directly into the storm."

---

## 1. System Overview

The Terminal is a **core developer utility Micro-App** that provides raw, direct command-line access to the BEEP agent. It serves as a power-user tool for developers, system administrators, and anyone who prefers a keyboard-driven interface for system orchestration.

It bypasses the nuanced conversational layer of the main `TopBar` input, sending commands directly for execution and displaying the raw, unfiltered JSON output from the agentic swarm.

---

## 2. Core Components & Implementation

### 2.1. The `terminal.tsx` Component
- **Input Line**: A persistent input line at the bottom of the component, prefixed with the classic `>` prompt.
- **Command History**: Supports up/down arrow keys to navigate through a session-specific command history.
- **Output Log**: A reverse-chronological, scrollable log that displays:
  - The command that was sent.
  - The final `responseText` from BEEP.
  - A formatted, collapsible JSON view of the complete `agentReports` object returned by BEEP, providing a transparent look into the agent's work.
- **Local Commands**: Handles a few client-side commands like `clear` (to wipe the log) and `help` (to show available commands).

### 2.2. State Management
- All state, including command history and the output log, is managed locally within the React component's state, making the Terminal a self-contained utility.

---

## 3. Integration with ΛΞVON OS

- **Direct BEEP Access**: The Terminal calls the same `handleCommandSubmit` function from the `app-store` as the main `TopBar`, but it is responsible for rendering the full, raw output object rather than just the user-facing text.
- **Debugging Tool**: It is an invaluable tool for developers and architects to debug agentic workflows, inspect the exact data being returned by tools, and test new BEEP commands.
- **Architectural Role**: It serves as a "back door" to the agentic system, satisfying the need for raw