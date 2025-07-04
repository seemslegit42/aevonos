# ΛΞVON OS - API Specification
Document Version: 1.3
Status: Canonized
Author: ARCHIVEX

## 1. Introduction

This document provides the definitive specification for the ΛΞVON OS API. It is designed for developers building integrations, Micro-Apps, or interacting with the OS programmatically. All API communication is over HTTPS and payloads are in JSON format.

### 1.1 Agent-First Doctrine

A core principle of ΛΞVON OS is its "agent-first" nature. While this document specifies traditional RESTful endpoints for retrieving data and managing resources, the most powerful interactions are achieved through the agentic core. Developers are strongly encouraged to use the `POST /api/v1/beep/command` endpoint for any complex operations, as this leverages the full reasoning and orchestration capabilities of the BEEP agent.

## 2. Authentication

The API uses a **Bearer Token** authentication scheme. A session token is managed on the client-side as a secure, `HttpOnly` cookie named `session`. API routes are authenticated on the server-side by validating this cookie. This token is derived from a Firebase-issued ID token.

Example: `Cookie: session=<your_session_token>`

## 3. Core Endpoints

### 3.1. Agentic Core

#### `POST /api/v1/beep/command`
The primary entry point for all agentic actions. This endpoint processes a natural language command through the BEEP agent.

**Request Body:**
```json
{
  "command_text": "string",
  "context": "string (optional)",
  "canvas_state": "object (optional)"
}
```
- **`command_text`**: The natural language command from the user.
- **`context`**: The context from which the command is issued (e.g., active Micro-App type).
- **`canvas_state`**: A JSON snapshot of current Micro-App states.

**Response (200 OK):**
```json
{
  "response": "string",
  "actionTriggered": {
    "launchedApps": ["string"],
    "generatedReports": ["string"],
    "suggestedCommandsCount": "integer"
  }
}
```
- **`response`**: A human-readable, narrative response from BEEP.
- **`actionTriggered`**: A summary of the actions taken by the agentic swarm.

---

### 3.2. User & Workspace

#### `GET /api/users/me`
Retrieves the profile of the currently authenticated user.

**Response (200 OK):**
```json
{
  "id": "string (cuid)",
  "email": "string",
  "firstName": "string | null",
  "lastName": "string | null",
  "role": "ADMIN | MANAGER | OPERATOR | AUDITOR",
  "psyche": "ZEN_ARCHITECT | SYNDICATE_ENFORCER | RISK_AVERSE_ARTISAN",
  "agentAlias": "string | null",
  "unlockedChaosCardKeys": ["string"]
}
```

#### `PUT /api/users/me`
Updates the profile of the currently authenticated user.

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "agentAlias": "string (optional)"
}
```
**Response (200 OK):** Returns the updated user profile object.

---

### 3.3. Architect (Admin) Endpoints
These endpoints are restricted to users with the `ADMIN` role who are also the owner of the workspace.

#### `GET /api/admin/overview`
Retrieves high-level dashboard statistics for the workspace.

**Response (200 OK):**
```json
{
  "userCount": "integer",
  "agentCount": "integer",
  "activeAgentCount": "integer",
  "creditBalance": "number",
  "planTier": "Apprentice | Artisan | Priesthood"
}
```

#### `GET /api/admin/users`
Retrieves a list of all users within the current workspace.

**Response (200 OK):** An array of user profile objects (see `GET /api/users/me`).

#### `GET /api/admin/vows`
Retrieves the founding vows and goals for all users in the workspace.

**Response (200 OK):**
```json
[
  {
    "id": "string (cuid)",
    "email": "string",
    "firstName": "string | null",
    "lastName": "string | null",
    "psyche": "ZEN_ARCHITECT | ...",
    "foundingVow": "string | null",
    "foundingGoal": "string | null"
  }
]
```

#### `GET /api/admin/covenants/{covenantName}/members`
Retrieves the member roster for a specific Covenant (`motion`, `worship`, or `silence`).

**Response (200 OK):** An array of user profile objects.

#### `GET /api/admin/covenants/{covenantName}/leaderboard`
Retrieves the Vow Alignment Score (VAS) leaderboard for a specific Covenant.

**Response (200 OK):** An array of user profile objects with an additional `vas` number field.

---

### 3.4. Security Endpoints (Aegis)

#### `GET /api/security/alerts`
Retrieves a list of all security alerts for the current workspace.

**Response (200 OK):** An array of `SecurityAlert` objects.

#### `GET /api/security/threat-feeds`
Retrieves the list of configured external threat intelligence feed URLs.

**Response (200 OK):** `[{ "id": "string", "url": "string" }]`

#### `PUT /api/security/threat-feeds`
Updates the list of threat intelligence feed URLs.

**Request Body:**
```json
{
  "feeds": ["string (url)"]
}
```
**Response (200 OK):** `{ "message": "Threat intelligence feeds updated successfully." }`

#### `GET /api/security/edicts`
Retrieves the list of internal security edicts for the workspace.

**Response (200 OK):** `[{ "id": "string", "description": "string", "isActive": "boolean" }]`

#### `PUT /api/security/edicts`
Updates the list of security edicts.

**Request Body:**
```json
{
  "edicts": [{ "description": "string", "isActive": "boolean" }]
}
```
**Response (200 OK):** `{ "message": "Security edicts updated successfully." }`

---

### 3.5. Proxy Agent Endpoints

#### `POST /api/proxy/initiate_transmutation`
Calculates the cost and gets a quote for transmuting ΞCredits into a real-world payment.

**Request Body:**
```json
{
  "amount": "number",
  "currency": "string (e.g., 'CAD')",
  "vendor": "string"
}
```
**Response (200 OK):** A quote object with cost breakdown.

#### `POST /api/proxy/execute_transmutation`
Executes the transmutation based on a previously fetched quote.

**Request Body:**
```json
{
  "quote": { /* The full quote object from the initiate step */ }
}
```
**Response (200 OK):** A success or failure message.

---

### 3.6. Error Responses
Errors are returned with a standard JSON structure.

**Example (403 Forbidden):**
```json
{
  "error": "Forbidden. Architect access required."
}
```

**Example (400 Bad Request):**
```json
{
  "error": "Invalid input.",
  "issues": [ /* Zod validation issues */ ]
}
```
