# Aegis Command: Threat Intelligence Console - Technical Specification

> "A shield is worthless without the eyes to see the blow coming."

---

## 1. System Overview

Aegis Command is a **privileged utility Micro-App** that serves as the configuration console for the Aegis subsystem. It is designed for administrators and security-conscious operators to manage both external and internal security rules.

This is not a dashboard for viewing alerts; that is the function of `Aegis-ThreatScope`. Aegis Command is where the operator defines *what* Aegis should be watching for.

---

## 2. Core Components & Implementation

### 2.1. The `Aegis-Command` Micro-App (`components/micro-apps/aegis-command.tsx`)
The UI is a tabbed interface for managing two types of security rules:
- **Threat Feeds**: Allows users to add, edit, and remove URLs pointing to external threat intelligence feeds (e.g., lists of malicious IPs, known phishing domains). These are dynamic, external sources of truth.
- **Security Edicts**: Allows users to define, activate, and deactivate internal, static rules of operation (e.g., "Workflows must not exfiltrate data to unauthorized channels."). These are the workspace's specific constitutional laws.
- **Secure Submission**: All changes are submitted via secure API endpoints that require `ADMIN` or `MANAGER` privileges.

### 2.2. Backend APIs
- **`/api/security/threat-feeds`**: A `GET` and `PUT` endpoint for managing the list of external threat feed URLs.
- **`/api/security/edicts`**: A `GET` and `PUT` endpoint for managing the list of internal security edicts.

### 2.3. Aegis Subsystem Integration
- **`aegisAnomalyScan`**: The core Aegis agent flow now fetches data from **both** the configured threat feeds and the active security edicts for the workspace. This enriched context allows Aegis to make more nuanced and accurate security assessments, flagging user actions that violate either external threat intelligence or internal policy.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: Aegis Command can be launched from the Canvas or via a BEEP command like, "configure Aegis feeds."
- **Permissions**: Access to this Micro-App is strictly controlled by user role. Only Administrators and Managers can view or modify the threat feed and edict configurations, preventing unauthorized changes to the system's security posture.
- **Architectural Role**: Aegis Command serves as the "eyes and ears" of the Aegis shield, allowing the operator to direct its gaze both outward (threat feeds) and inward (edicts). It reinforces the principle of a sovereign, user-configurable security posture.
