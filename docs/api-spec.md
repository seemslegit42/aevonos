# ΛΞVON OS - API Specification
Document Version: 1.1
Status: Canonized
Author: ARCHIVEX

## 1. Introduction

This document provides the definitive specification for the ΛΞVON OS external and internal-facing APIs. It is designed for developers building integrations, Micro-Apps, or interacting with the OS programmatically. All API communication is over HTTPS and payloads are in JSON format.

## 2. Authentication

The API uses a **Bearer Token** authentication scheme. A short-lived JSON Web Token (JWT) is provided to the client upon successful authentication (via the Rite of Invocation/Presence Protocol). This token must be included in the `Authorization` header for all protected endpoints.

Example: `Authorization: Bearer <your_jwt_here>`

The JWT is managed on the client-side as a secure, `HttpOnly` cookie named `session`. API routes are authenticated server-side by validating this cookie.

## 3. Core Endpoints

### 3.1. Agentic Core

#### **`POST /api/v1/beep/command`**
The primary entry point for all agentic actions. This endpoint processes a natural language command through the BEEP agent and orchestrates the necessary workflows.

**Request Body:**
```json
{
  "command_text": "string",
  "context": "string (optional: 'core_os' | 'folly_instrument')",
  "canvas_state": "object (optional)"
}
```
- **`command_text`**: The natural language command from the user.
- **`context`**: The context from which the command is issued, used to load the correct BEEP personality matrix.
- **`canvas_state`**: A JSON snapshot of the current state of all active Micro-Apps, providing richer context to the agent.

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

#### **`GET /api/users/me`**
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

#### **`PUT /api/users/me`**
Updates the profile of the currently authenticated user.

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "agentAlias": "string (optional)"
}
```

**Response (200 OK):**
Returns the updated user profile object.

---

### 3.3. Architect (Admin) Endpoints

These endpoints are restricted to users with the `ADMIN` role who are also the owner of the workspace.

#### **`GET /api/admin/overview`**
Retrieves high-level statistics for the workspace dashboard. This endpoint is cached for performance.

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

#### **`GET /api/admin/users`**
Retrieves a list of all users within the current workspace. This endpoint is cached for performance.

**Response (200 OK):**
An array of user profile objects as defined in `GET /api/users/me`.

#### **`GET /api/admin/vows`**
Retrieves the founding vows and goals for all users in the workspace, providing insight into the collective purpose of the team.

**Response (200 OK):**
```json
[
    {
        "id": "string (cuid)",
        "email": "string",
        "firstName": "string | null",
        "lastName": "string | null",
        "psyche": "ZEN_ARCHITECT | SYNDICATE_ENFORCER | RISK_AVERSE_ARTISAN",
        "foundingVow": "string | null",
        "foundingGoal": "string | null"
    }
]
```

#### **`GET /api/admin/covenants/{covenantName}/members`**
Retrieves the member roster for a specific Covenant (`motion`, `worship`, or `silence`).

**Response (200 OK):**
```json
[
    {
        "id": "string (cuid)",
        "email": "string",
        "firstName": "string | null",
        "lastName": "string | null"
    }
]
```

#### **`GET /api/admin/covenants/{covenantName}/leaderboard`**
Retrieves the Vow Alignment Score (VAS) leaderboard for a specific Covenant.

**Response (200 OK):**
```json
[
    {
        "id": "string (cuid)",
        "email": "string",
        "firstName": "string | null",
        "lastName": "string | null",
        "vas": "number"
    }
]
```

---

### 3.4. Error Responses

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
