# ΛΞVON OS: Public API Specification

This document provides the formal OpenAPI 3.0 specification for the ΛΞVON OS Public API. It details the endpoints, data models, authentication methods, and error handling, serving as the definitive contract for external developers and services interacting with the platform.

**Version**: 1.0.0
**Description**: The official Public API for ΛΞVON OS, the Intelligent Operating System for SMBs. This RESTful API allows external applications to seamlessly integrate with ΛΞVON OS functionalities, enabling AI-powered task delegation, workflow orchestration, secure data synchronization, and access to core platform intelligence.

---

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "ΛΞVON OS Public API",
    "version": "1.0.0",
    "description": "The official Public API for ΛΞVON OS, the Intelligent Operating System for SMBs. This RESTful API allows external applications to seamlessly integrate with ΛΞVON OS functionalities, enabling AI-powered task delegation, workflow orchestration, secure data synchronization, and access to core platform intelligence."
  },
  "servers": [
    {
      "url": "https://api.aevonos.com/v1",
      "description": "Production ΛΞVON OS API Endpoint (Serverless Next.js API Routes)"
    },
    {
      "url": "http://localhost:3000/api",
      "description": "Local Development Endpoint (Next.js API Routes)"
    }
  ],
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "tags": [
    { "name": "Authentication", "description": "User identity and session management." },
    { "name": "Users", "description": "Management of user profiles and preferences." },
    { "name": "Workspaces", "description": "Management of tenant workspaces and their configurations." },
    { "name": "BEEP", "description": "Natural language interaction and AI assistant capabilities." },
    { "name": "Workflows", "description": "Loom Studio workflow definitions and execution management." },
    { "name": "Agents", "description": "Deployment and monitoring of AI agents." },
    { "name": "CRM", "description": "Management of contacts and customer data." },
    { "name": "Security", "description": "Aegis security alerts, threat intelligence, and baseline management." },
    { "name": "Billing", "description": "Management of plans, subscriptions, and usage." },
    { "name": "MicroApps", "description": "Discovery and interaction with modular Micro-Apps." },
    { "name": "Integrations", "description": "Management of third-party service connections." },
    { "name": "Export", "description": "Endpoints for exporting system data." }
  ],
  "paths": {
    "/auth/login": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Authenticate a user and issue a JWT.",
        "operationId": "loginUser",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/LoginRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Authentication successful.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuthResponse" } } }
          },
          "401": { "description": "Invalid credentials." }
        }
      }
    },
    "/auth/register": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Register a new user and create their default workspace.",
        "operationId": "registerUser",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/RegisterRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User and workspace created successfully.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuthResponse" } } }
          },
          "409": { "description": "User with this email already exists." }
        }
      }
    },
    "/users/me": {
      "get": {
        "tags": ["Users"],
        "summary": "Retrieve the authenticated user's profile.",
        "operationId": "getCurrentUser",
        "responses": {
          "200": {
            "description": "Current user profile.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } }
          },
          "401": { "description": "Unauthorized." }
        }
      },
      "put": {
        "tags": ["Users"],
        "summary": "Update the authenticated user's profile.",
        "operationId": "updateCurrentUser",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/UserUpdateRequest" } } }
        },
        "responses": {
          "200": {
            "description": "User profile updated successfully.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } }
          },
          "400": { "description": "Invalid input." }
        }
      }
    },
    "/user/pulse": {
      "get": {
        "tags": ["Users"],
        "summary": "Retrieve the user's current Pulse Narrative.",
        "operationId": "getUserPulse",
        "description": "Fetches the poetic, narrative string describing the user's current phase in the Klepsydra (Profit Pulse) Engine.",
        "responses": {
          "200": {
            "description": "The user's current pulse narrative.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": { "narrative": { "type": "string", "example": "The river of fortune swells. Ride it before it turns." } }
                }
              }
            }
          },
          "401": { "description": "Unauthorized." }
        }
      }
    },
    "/workspaces/me": {
      "get": {
        "tags": ["Workspaces"],
        "summary": "Retrieve the authenticated user's current workspace details.",
        "operationId": "getCurrentWorkspace",
        "responses": {
          "200": {
            "description": "Current workspace details.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Workspace" } } }
          },
          "401": { "description": "Unauthorized." }
        }
      }
    },
    "/beep/command": {
      "post": {
        "tags": ["BEEP"],
        "summary": "Send a natural language command to BEEP for processing.",
        "operationId": "sendBeepCommand",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/BeepCommandRequest" } }
          }
        },
        "responses": {
          "200": {
            "description": "BEEP's response to the command.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/BeepCommandResponse" } } }
          },
          "400": { "description": "Invalid command or context." }
        }
      }
    },
    "/workflows": {
      "get": {
        "tags": ["Workflows"],
        "summary": "Retrieve a list of all defined Loom Studio workflows.",
        "operationId": "listWorkflows",
        "responses": {
          "200": {
            "description": "A list of workflow definitions.",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/WorkflowDefinition" } } } }
          }
        }
      },
      "post": {
        "tags": ["Workflows"],
        "summary": "Create a new Loom Studio workflow definition.",
        "operationId": "createWorkflow",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WorkflowCreationRequest" } } }
        },
        "responses": {
          "201": {
            "description": "Workflow created successfully.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WorkflowDefinition" } } }
          },
          "400": { "description": "Invalid workflow definition." },
          "403": { "description": "Permission denied." }
        }
      }
    },
    "/workflows/{workflowId}/run": {
      "post": {
        "tags": ["Workflows"],
        "summary": "Trigger a specific workflow execution.",
        "operationId": "triggerWorkflowRun",
        "parameters": [ { "name": "workflowId", "in": "path", "required": true, "schema": { "type": "string" }, "description": "ID of the workflow to execute." } ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "description": "The payload to pass to the workflow run.", "additionalProperties": true }
            }
          }
        },
        "responses": {
          "202": {
            "description": "Workflow run initiated successfully.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WorkflowRunSummary" } } }
          },
          "404": { "description": "Workflow not found." },
          "403": { "description": "Permission denied." }
        }
      }
    },
    "/contacts": {
      "get": {
        "tags": ["CRM"],
        "summary": "Retrieve a list of contacts.",
        "operationId": "listContacts",
        "responses": {
          "200": {
            "description": "A list of contacts.",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Contact" } } } }
          }
        }
      },
      "post": {
        "tags": ["CRM"],
        "summary": "Create a new contact.",
        "operationId": "createContact",
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ContactCreationRequest" } } } },
        "responses": {
          "201": { "description": "Contact created.", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Contact" } } } },
          "409": { "description": "Contact with this email already exists." }
        }
      }
    },
    "/security/alerts": {
      "get": {
        "tags": ["Security"],
        "summary": "Retrieve security alerts generated by Aegis.",
        "operationId": "listSecurityAlerts",
        "responses": {
          "200": {
            "description": "A list of security alerts.",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/SecurityAlert" } } } }
          }
        }
      }
    },
    "/billing/transactions": {
      "get": {
        "tags": ["Billing"],
        "summary": "Retrieve transaction history for the current workspace.",
        "operationId": "getTransactionHistory",
        "parameters": [ { "name": "limit", "in": "query", "schema": { "type": "integer", "default": 20 } } ],
        "responses": {
          "200": {
            "description": "A list of transactions.",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Transaction" } } } }
          }
        }
      }
    },
    "/export/dossier": {
      "post": {
        "tags": ["Export"],
        "summary": "Export a compiled dossier as PDF or JSON.",
        "operationId": "exportDossier",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/DossierExportRequest" } } }
        },
        "responses": {
          "200": { "description": "Dossier exported successfully.", "content": { "application/pdf": {}, "application/json": {} } },
          "400": { "description": "Bad request (e.g., missing password for encryption)." }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
    },
    "schemas": {
      "LoginRequest": {
        "type": "object",
        "properties": {
          "email": { "type": "string", "format": "email" },
          "password": { "type": "string", "format": "password" }
        },
        "required": ["email", "password"]
      },
      "RegisterRequest": {
        "type": "object",
        "properties": {
          "email": { "type": "string", "format": "email" },
          "password": { "type": "string", "format": "password" },
          "firstName": { "type": "string" },
          "lastName": { "type": "string" },
          "workspaceName": { "type": "string" }
        },
        "required": ["email", "password", "workspaceName"]
      },
      "AuthResponse": {
        "type": "object",
        "properties": {
          "accessToken": { "type": "string" },
          "tokenType": { "type": "string", "example": "Bearer" },
          "expiresIn": { "type": "integer", "example": 3600 },
          "user": { "$ref": "#/components/schemas/User" }
        }
      },
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "firstName": { "type": "string", "nullable": true },
          "lastName": { "type": "string", "nullable": true },
          "role": { "type": "string", "enum": ["ADMIN", "MANAGER", "OPERATOR", "AUDITOR"] },
          "lastLoginAt": { "type": "string", "format": "date-time", "nullable": true }
        }
      },
      "UserUpdateRequest": {
        "type": "object",
        "properties": {
          "firstName": { "type": "string", "nullable": true },
          "lastName": { "type": "string", "nullable": true },
          "email": { "type": "string", "format": "email", "nullable": true }
        }
      },
      "Workspace": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "planTier": { "type": "string", "enum": ["Apprentice", "Artisan", "Priesthood"] },
          "credits": { "type": "number", "format": "decimal" }
        }
      },
      "BeepCommandRequest": {
        "type": "object",
        "properties": {
          "command": { "type": "string" },
          "context": { "type": "object", "nullable": true }
        },
        "required": ["command"]
      },
      "BeepCommandResponse": {
        "type": "object",
        "properties": {
          "response": { "type": "string" },
          "actionTriggered": { "type": "object", "nullable": true }
        }
      },
      "Transaction": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "workspaceId": { "type": "string" },
          "userId": { "type": "string", "nullable": true },
          "type": { "type": "string", "enum": ["CREDIT", "DEBIT", "TRIBUTE"] },
          "amount": { "type": "number", "format": "decimal" },
          "description": { "type": "string" },
          "status": { "type": "string", "enum": ["PENDING", "COMPLETED", "FAILED"] },
          "createdAt": { "type": "string", "format": "date-time" }
        }
      },
      "WorkflowDefinition": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "isActive": { "type": "boolean" },
          "triggerType": { "type": "string", "enum": ["api", "schedule", "event"] },
          "definition": { "type": "object", "description": "JSON representation of the workflow graph." }
        }
      },
      "WorkflowCreationRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "definition": { "type": "object" }
        },
        "required": ["name", "definition"]
      },
      "WorkflowRunSummary": {
        "type": "object",
        "properties": {
          "runId": { "type": "string" },
          "status": { "type": "string", "enum": ["pending", "running", "completed", "failed", "paused"] },
          "startedAt": { "type": "string", "format": "date-time" }
        }
      },
      "Contact": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "email": { "type": "string", "format": "email", "nullable": true },
          "firstName": { "type": "string", "nullable": true },
          "lastName": { "type": "string", "nullable": true },
          "phone": { "type": "string", "nullable": true }
        }
      },
      "ContactCreationRequest": {
        "type": "object",
        "properties": {
          "email": { "type": "string", "format": "email", "nullable": true },
          "firstName": { "type": "string", "nullable": true },
          "lastName": { "type": "string", "nullable": true },
          "phone": { "type": "string", "nullable": true }
        }
      },
      "SecurityAlert": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string" },
          "explanation": { "type": "string" },
          "riskLevel": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      },
      "DossierExportRequest": {
        "type": "object",
        "properties": {
          "format": { "type": "string", "enum": ["pdf", "json"] },
          "encrypt": { "type": "boolean" },
          "password": { "type": "string", "format": "password" },
          "dossierInput": { "$ref": "#/components/schemas/DossierInput" }
        },
        "required": ["format", "dossierInput"]
      },
      "DossierInput": {
        "type": "object",
        "properties": {
            "targetName": { "type": "string" },
            "osintReport": { "type": "object", "nullable": true },
            "analysisResult": { "type": "object", "nullable": true },
            "decoyResult": { "type": "object", "nullable": true }
        },
        "required": ["targetName"]
      }
    }
  }
}
```
