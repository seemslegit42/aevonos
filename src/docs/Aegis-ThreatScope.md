# Aegis ThreatScope: Real-Time Alert Feed - Technical Specification

> "Vigilance is the currency of peace. Here is your ledger."

---

## 1. System Overview

Aegis ThreatScope is a **core utility Micro-App** that functions as the primary user-facing viewport for the Aegis subsystem. It provides a real-time, reverse-chronological feed of all security alerts generated within the workspace.

This is the designated "pane of glass" through which an operator observes the actions of Aegis. It is designed for clarity, immediacy, and actionable insight, not deep configuration.

---

## 2. Core Components & Implementation

### 2.1. The `Aegis-ThreatScope` Micro-App (`micro-apps/aegis-threatscope.tsx`)
The UI is designed to be a clean, easily scannable feed of security events.
- **Alert Feed**: Displays a list of `SecurityAlert` cards, each showing the alert type, risk level, a human-readable explanation, and a timestamp.
- **Real-Time Updates**: The component is designed to poll the backend API periodically to refresh the alert list, ensuring the operator has the most current view of the system's security status.
- **Risk-Based Styling**: Alerts are color-coded based on their `riskLevel` (`low`, `medium`, `high`, `critical`) to allow for immediate visual triage.

### 2.2. Backend API (`api/security/alerts/route.ts`)
- **`GET /api/security/alerts`**: A secure endpoint that retrieves all `SecurityAlert` records associated with the authenticated user's workspace, ordered from most to least recent.

### 2.3. Aegis Subsystem Integration
- **`createSecurityAlertInDb` Tool**: The Aegis agent uses this tool to create a new `SecurityAlert` record in the database whenever it detects a high-risk anomaly.
- **Data Flow**: The Aegis agent detects a threat -> calls `createSecurityAlertInDb` -> the alert is saved to the database -> the `Aegis-ThreatScope` UI polls the API and displays the new alert.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: Aegis ThreatScope can be launched from the Canvas or summoned by BEEP, especially in response to a high-risk event (e.g., "Aegis has detected a critical anomaly. Launching ThreatScope now.").
- **Architectural Role**: It serves as the "voice" of Aegis, translating the subsystem's findings into a format that the operator can understand and act upon. It is a critical component for maintaining trust and transparency in the OS's autonomous security functions.
