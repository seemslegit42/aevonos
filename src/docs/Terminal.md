# Terminal: The Invocation Chamber - Technical Specification

> "Words have power. Here, they have authority."

---

## 1. System Overview

The Terminal is a **core utility Micro-App** that provides a direct, command-line interface (CLI) to the underlying system and the BEEP agent. It is designed for power users, developers, and operators who prefer the speed and precision of text-based commands.

This is not just a standard shell; it is an invocation chamber where commands are directly translated into agentic actions and system operations.

---

## 2. Core Components & Implementation

### 2.1. The `Terminal` Micro-App (`micro-apps/terminal.tsx`)
The UI is a minimalist, single-pane terminal emulator.
- **Command Input**: A prompt for entering text commands.
- **Output Display**: A scrolling display for command output, agent responses, and system messages.
- **BEEP Integration**: All commands entered into the Terminal are piped directly to the central `handleCommandSubmit` function in the app store. This means the Terminal is, in essence, a dedicated, full-window interface to the BEEP agent.

### 2.2. Command Parsing
- **Agentic Passthrough**: Most commands are treated as natural language and passed to BEEP for interpretation and execution.
- **System Commands**: A small set of reserved system commands (e.g., `clear`, `help`, `logout`) would be handled directly by the Terminal component for immediate execution.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: The Terminal can be launched from the Canvas or The Armory. It can also be summoned by BEEP, especially in response to a command that requires complex text output (e.g., "show me the raw logs for the last workflow run").
- **Architectural Role**: The Terminal is a critical component for power users, reinforcing the "Command-First" prime directive of the OS. It ensures that users are never limited by the graphical interface and always have a direct line to the full power of the system's agentic core.
