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
    { "name": "Covenants", "description": "Management of community cohorts and their data." },
    { "name": "MicroApps", "description": "Discovery and interaction with modular Micro-Apps." },
    { "name": "Integrations", "description": "Management of third-party service connections." },
    { "name": "Export", "description": "Endpoints for exporting system data." },
    { "name": "Admin", "description": "Privileged endpoints for workspace administration." }
  ],
  "paths": {
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
            "description": "User and workspace created successfully."
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
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PulseState" } } }
          },
          "401": { "description": "Unauthorized." }
        }
      }
    },
    "/user/pulse-profile": {
      "get": {
        "tags": ["Users"],
        "summary": "Retrieve the user's full Pulse Profile.",
        "operationId": "getUserPulseProfile",
        "description": "Fetches the detailed psychological and economic state for the user.",
        "responses": {
          "200": {
            "description": "The user's pulse profile.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PulseProfile" } } }
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
      },
       "put": {
        "tags": ["Workspaces"],
        "summary": "Update the authenticated user's current workspace.",
        "operationId": "updateCurrentWorkspace",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WorkspaceUpdateRequest" } } }
        },
        "responses": {
          "200": {
            "description": "Workspace updated.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Workspace" } } }
          }
        }
      }
    },
     "/workspaces/me/economy-stats": {
      "get": {
        "tags": ["Workspaces"],
        "summary": "Retrieve workspace economy statistics.",
        "operationId": "getEconomyStats",
        "responses": {
          "200": {
            "description": "Economy statistics for the workspace.",
            "content": { "application/json": { "schema": { "type": "object", "properties": { "totalCreditsBurned": { "type": "number" } } } } }
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
        "description": "All agentic tools (e.g., Stonks Bot, Dr. Syntax) are accessed through this central command endpoint.",
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
        "summary": "Retrieve a list of all defined Loom Studio workflows for the workspace.",
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
    "/workflows/{workflowId}": {
       "get": {
        "tags": ["Workflows"],
        "summary": "Retrieve a specific workflow definition.",
        "operationId": "getWorkflow",
        "parameters": [ { "name": "workflowId", "in": "path", "required": true, "schema": { "type": "string" } } ],
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WorkflowDefinition" } } } },
          "404": { "description": "Workflow not found." }
        }
      },
      "put": {
        "tags": ["Workflows"],
        "summary": "Update a workflow definition.",
        "operationId": "updateWorkflow",
        "parameters": [ { "name": "workflowId", "in": "path", "required": true, "schema": { "type": "string" } } ],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WorkflowUpdateRequest" } } } },
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WorkflowDefinition" } } } },
          "403": { "description": "Permission denied." }
        }
      },
      "delete": {
        "tags": ["Workflows"],
        "summary": "Delete a workflow.",
        "operationId": "deleteWorkflow",
        "parameters": [ { "name": "workflowId", "in": "path", "required": true, "schema": { "type": "string" } } ],
        "responses": {
          "204": { "description": "Workflow deleted." },
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
    "/workflows/runs": {
       "get": {
        "tags": ["Workflows"],
        "summary": "Retrieve a list of workflow runs.",
        "operationId": "listWorkflowRuns",
        "parameters": [
          { "name": "workflowId", "in": "query", "schema": { "type": "string" } },
          { "name": "status", "in": "query", "schema": { "type": "string", "enum": ["pending", "running", "completed", "failed", "paused"] } }
        ],
        "responses": {
          "200": { "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/WorkflowRun" } } } } }
        }
      }
    },
     "/workflows/runs/{runId}": {
      "get": {
        "tags": ["Workflows"],
        "summary": "Retrieve details of a specific workflow run.",
        "operationId": "getWorkflowRun",
        "parameters": [{ "name": "runId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WorkflowRun" } } } },
          "404": { "description": "Workflow run not found." }
        }
      }
    },
    "/agents": {
      "get": {
        "tags": ["Agents"],
        "summary": "Retrieve a list of all deployed agents for the workspace.",
        "operationId": "listAgents",
        "responses": {
          "200": {
            "description": "A list of agents.",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Agent" } } } }
          }
        }
      },
      "post": {
        "tags": ["Agents"],
        "summary": "Deploy a new agent.",
        "operationId": "deployAgent",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AgentDeploymentRequest" } } }
        },
        "responses": {
          "201": {
            "description": "Agent deployed successfully.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Agent" } } }
          },
          "400": { "description": "Invalid agent deployment request." },
          "403": { "description": "Permission denied." }
        }
      }
    },
    "/agents/{agentId}": {
      "get": {
        "tags": ["Agents"],
        "summary": "Retrieve a specific agent's details.",
        "operationId": "getAgent",
        "parameters": [ { "name": "agentId", "in": "path", "required": true, "schema": { "type": "string" } } ],
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Agent" } } } },
          "404": { "description": "Agent not found." }
        }
      },
      "put": {
        "tags": ["Agents"],
        "summary": "Update an agent's configuration.",
        "operationId": "updateAgent",
        "parameters": [ { "name": "agentId", "in": "path", "required": true, "schema": { "type": "string" } } ],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AgentUpdateRequest" } } } },
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Agent" } } } },
          "403": { "description": "Permission denied." }
        }
      },
      "delete": {
        "tags": ["Agents"],
        "summary": "Decommission an agent.",
        "operationId": "deleteAgent",
        "parameters": [ { "name": "agentId", "in": "path", "required": true, "schema": { "type": "string" } } ],
        "responses": {
          "204": { "description": "Agent decommissioned." },
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
     "/contacts/{contactId}": {
      "get": {
        "tags": ["CRM"],
        "summary": "Retrieve a specific contact.",
        "operationId": "getContact",
        "parameters": [{ "name": "contactId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Contact" } } } },
          "404": { "description": "Contact not found." }
        }
      },
      "put": {
        "tags": ["CRM"],
        "summary": "Update a contact.",
        "operationId": "updateContact",
        "parameters": [{ "name": "contactId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ContactUpdateRequest" } } } },
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Contact" } } } }
        }
      },
      "delete": {
        "tags": ["CRM"],
        "summary": "Delete a contact.",
        "operationId": "deleteContact",
        "parameters": [{ "name": "contactId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": {
          "204": { "description": "Contact deleted." }
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
    "/security/threat-feeds": {
      "get": {
        "tags": ["Security"],
        "summary": "Retrieve configured threat intelligence feeds.",
        "operationId": "getThreatFeeds",
        "responses": {
          "200": { "description": "List of threat feed URLs.", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/ThreatFeed" } } } } }
        }
      },
      "put": {
        "tags": ["Security"],
        "summary": "Update the list of threat intelligence feeds.",
        "operationId": "configureThreatFeeds",
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ThreatFeedUpdateRequest" } } } },
        "responses": {
          "200": { "description": "Feeds updated successfully." }
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
    "/billing/transactions/{transactionId}/confirm": {
      "post": {
        "tags": ["Billing"],
        "summary": "Confirm a pending credit transaction.",
        "operationId": "confirmTransaction",
        "description": "Allows an administrator to confirm a pending credit transaction, such as one from an e-Transfer. This updates the transaction status to COMPLETED and applies the credits to the workspace balance.",
        "parameters": [{ "name": "transactionId", "in": "path", "required": true, "schema": { "type": "string" }, "description": "The ID of the pending transaction to confirm." }],
        "responses": {
          "200": {
            "description": "Transaction confirmed successfully.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Transaction" } } }
          },
          "403": { "description": "Forbidden. Administrator access required." },
          "404": { "description": "Pending transaction not found." }
        }
      }
    },
     "/billing/usage/agent-actions": {
      "get": {
        "tags": ["Billing"],
        "summary": "Get current usage details for the workspace.",
        "operationId": "getAgentActionUsage",
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/BillingUsage" } } } }
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
    },
    "/admin/overview": {
      "get": {
        "tags": ["Admin"],
        "summary": "Get an overview of workspace statistics.",
        "operationId": "getAdminOverview",
        "description": "Retrieves high-level statistics for the current workspace. Requires ADMIN role.",
        "responses": {
          "200": {
            "description": "Workspace overview statistics.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AdminOverview" } } }
          },
          "401": { "description": "Unauthorized." },
          "403": { "description": "Forbidden." }
        }
      }
    },
    "/admin/users": {
      "get": {
        "tags": ["Admin"],
        "summary": "List all users in the workspace.",
        "operationId": "listWorkspaceUsers",
        "description": "Retrieves a list of all users associated with the current workspace. Requires ADMIN role.",
        "responses": {
          "200": {
            "description": "A list of users.",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/User" } } } }
          },
          "401": { "description": "Unauthorized." },
          "403": { "description": "Forbidden." }
        }
      }
    },
     "/admin/vows": {
      "get": {
        "tags": ["Admin"],
        "summary": "Retrieve all founding vows from users in the workspace.",
        "operationId": "listSacredVows",
        "responses": {
          "200": {
            "description": "A list of user vows.",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/SacredVow" } } } }
          },
          "403": { "description": "Forbidden." }
        }
      }
    },
    "/covenants/me": {
      "get": {
        "tags": ["Covenants"],
        "summary": "Get the authenticated user's Covenant details.",
        "operationId": "getMyCovenant",
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Covenant" } } } }
        }
      }
    },
    "/covenants/{covenantName}/leaderboard": {
      "get": {
        "tags": ["Covenants"],
        "summary": "Get the leaderboard for a specific Covenant.",
        "operationId": "getCovenantLeaderboard",
        "parameters": [{ "name": "covenantName", "in": "path", "required": true, "schema": { "type": "string", "enum": ["motion", "worship", "silence"] } }],
        "responses": {
          "200": { "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/LeaderboardEntry" } } } } }
        }
      }
    },
    "/covenants/{covenantName}/members": {
      "get": {
        "tags": ["Covenants"],
        "summary": "List members of a specific Covenant.",
        "operationId": "getCovenantMembers",
        "parameters": [{ "name": "covenantName", "in": "path", "required": true, "schema": { "type": "string", "enum": ["motion", "worship", "silence"] } }],
        "responses": {
          "200": { "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/User" } } } } },
          "403": { "description": "Forbidden." }
        }
      }
    },
     "/microapps": {
      "get": {
        "tags": ["MicroApps"],
        "summary": "List all available Micro-App manifests.",
        "operationId": "listMicroApps",
        "responses": {
          "200": { "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/ArtifactManifest" } } } } }
        }
      }
    },
     "/integrations": {
      "get": {
        "tags": ["Integrations"],
        "summary": "List configured integrations for the workspace.",
        "operationId": "listIntegrations",
        "responses": {
          "200": { "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/ConfiguredIntegration" } } } } }
        }
      },
      "post": {
        "tags": ["Integrations"],
        "summary": "Create a new integration instance.",
        "operationId": "createIntegration",
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/IntegrationConfigurationRequest" } } } },
        "responses": {
          "201": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ConfiguredIntegration" } } } }
        }
      }
    },
    "/integrations/{integrationId}": {
      "put": {
        "tags": ["Integrations"],
        "summary": "Update an integration configuration.",
        "operationId": "updateIntegration",
        "parameters": [{ "name": "integrationId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/IntegrationUpdateRequest" } } } },
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ConfiguredIntegration" } } } }
        }
      },
      "delete": {
        "tags": ["Integrations"],
        "summary": "Delete an integration.",
        "operationId": "deleteIntegration",
        "parameters": [{ "name": "integrationId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": {
          "204": { "description": "Integration deleted." }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
    },
    "schemas": {
      "RegisterRequest": {
        "type": "object",
        "properties": {
          "email": { "type": "string", "format": "email" },
          "password": { "type": "string", "minLength": 8 },
          "workspaceName": { "type": "string", "description": "The name for the primary workspace or 'Canvas'." },
          "agentAlias": { "type": "string", "description": "A personalized name for the core BEEP agent.", "nullable": true },
          "psyche": { "$ref": "#/components/schemas/UserPsyche" },
          "whatMustEnd": { "type": "string", "description": "The user's declared 'sacrifice' during the Rite of Invocation.", "nullable": true },
          "goal": { "type": "string", "description": "The user's declared 'vow' or goal during the Rite of Invocation.", "nullable": true }
        },
        "required": ["email", "password", "workspaceName", "psyche"]
      },
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "firstName": { "type": "string", "nullable": true },
          "lastName": { "type": "string", "nullable": true },
          "role": { "type": "string", "enum": ["ADMIN", "MANAGER", "OPERATOR", "AUDITOR"] },
          "agentAlias": { "type": "string", "nullable": true, "description": "The user's personalized name for BEEP." },
          "psyche": { "$ref": "#/components/schemas/UserPsyche", "nullable": true },
          "lastLoginAt": { "type": "string", "format": "date-time", "nullable": true }
        }
      },
       "UserPsyche": {
        "type": "string",
        "enum": ["ZEN_ARCHITECT", "SYNDICATE_ENFORCER", "RISK_AVERSE_ARTISAN"],
        "description": "The psychological archetype chosen by the user during the Rite of Invocation."
      },
      "UserUpdateRequest": {
        "type": "object",
        "properties": {
          "firstName": { "type": "string", "nullable": true },
          "lastName": { "type": "string", "nullable": true },
          "email": { "type": "string", "format": "email", "nullable": true },
          "agentAlias": { "type": "string", "nullable": true }
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
       "WorkspaceUpdateRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "nullable": true },
          "planTier": { "type": "string", "enum": ["Apprentice", "Artisan", "Priesthood"], "nullable": true }
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
          "actionTriggered": { "type": "object", "nullable": true, "properties": {
              "launchedApps": { "type": "array", "items": { "type": "string" }},
              "generatedReports": { "type": "array", "items": { "type": "string" }},
              "suggestedCommandsCount": { "type": "integer" }
          }}
        }
      },
      "Transaction": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "workspaceId": { "type": "string" },
          "userId": { "type": "string", "nullable": true },
          "type": { "type": "string", "enum": ["CREDIT", "DEBIT", "TRIBUTE"] },
          "amount": { "type": "number", "format": "decimal", "description": "The net change to the balance. For tributes, this is boonAmount - tributeAmount." },
          "description": { "type": "string" },
          "status": { "type": "string", "enum": ["PENDING", "COMPLETED", "FAILED"] },
          "createdAt": { "type": "string", "format": "date-time" },
          "instrumentId": { "type": "string", "nullable": true, "description": "The ID of the instrument used in a TRIBUTE transaction (e.g., a Chaos Card key)." },
          "luckWeight": { "type": "number", "format": "float", "nullable": true, "description": "The user's luck value at the time of a TRIBUTE transaction." },
          "outcome": { "type": "string", "nullable": true, "description": "The outcome of a TRIBUTE transaction (e.g., 'win', 'loss')." },
          "boonAmount": { "type": "number", "format": "decimal", "nullable": true, "description": "The amount of credits awarded as a boon in a TRIBUTE transaction." },
          "userPsyche": { "$ref": "#/components/schemas/UserPsyche", "nullable": true }
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
          "definition": { "type": "object" },
          "isActive": { "type": "boolean" },
          "triggerType": { "type": "string", "enum": ["api", "schedule", "event"] }
        },
        "required": ["name", "definition"]
      },
      "WorkflowUpdateRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "definition": { "type": "object" },
          "isActive": { "type": "boolean" }
        }
      },
      "WorkflowRun": {
        "type": "object",
        "properties": {
           "id": { "type": "string" },
           "workflowId": { "type": "string" },
           "workspaceId": { "type": "string" },
           "status": { "type": "string", "enum": ["pending", "running", "completed", "failed", "paused"] },
           "triggerPayload": { "type": "object" },
           "output": { "type": "object" },
           "log": { "type": "array", "items": {"type": "object"} },
           "startedAt": { "type": "string", "format": "date-time" },
           "finishedAt": { "type": "string", "format": "date-time", "nullable": true },
           "workflow": { "type": "object", "properties": { "name": { "type": "string" } } }
        }
      },
      "WorkflowRunSummary": {
        "type": "object",
        "properties": {
          "runId": { "type": "string" },
          "status": { "type": "string", "enum": ["pending", "running", "completed", "failed", "paused"] },
          "startedAt": { "type": "string", "format": "date-time" }
        }
      },
      "Agent": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "type": { "type": "string" },
          "description": { "type": "string", "nullable": true },
          "status": { "type": "string", "enum": ["active", "idle", "processing", "paused", "error"] },
          "configuration": { "type": "object", "nullable": true }
        }
      },
      "AgentDeploymentRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "type": { "type": "string" },
          "description": { "type": "string", "nullable": true },
          "configuration": { "type": "object", "nullable": true }
        },
        "required": ["name", "type"]
      },
      "AgentUpdateRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string", "nullable": true },
          "status": { "type": "string", "enum": ["active", "idle", "processing", "paused", "error"] }
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
       "ContactUpdateRequest": {
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
       "ThreatFeed": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "url": { "type": "string", "format": "uri" }
        }
      },
      "ThreatFeedUpdateRequest": {
        "type": "object",
        "properties": {
          "feeds": { "type": "array", "items": { "type": "string", "format": "uri" } }
        }
      },
       "BillingUsage": {
        "type": "object",
        "properties": {
          "currentPeriod": { "type": "string", "format": "date" },
          "totalActionsUsed": { "type": "integer" },
          "planLimit": { "type": "integer" },
          "planTier": { "type": "string" },
          "overageEnabled": { "type": "boolean" }
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
      },
      "AdminOverview": {
        "type": "object",
        "properties": {
          "userCount": { "type": "integer" },
          "agentCount": { "type": "integer" },
          "activeAgentCount": { "type": "integer" },
          "creditBalance": { "type": "number" },
          "planTier": { "type": "string" }
        }
      },
      "SacredVow": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "email": { "type": "string" },
          "firstName": { "type": "string", "nullable": true },
          "lastName": { "type": "string", "nullable": true },
          "psyche": { "$ref": "#/components/schemas/UserPsyche" },
          "foundingVow": { "type": "string", "nullable": true },
          "foundingGoal": { "type": "string", "nullable": true }
        }
      },
      "Covenant": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "symbol": { "type": "string" }
        }
      },
      "LeaderboardEntry": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "email": { "type": "string" },
          "firstName": { "type": "string", "nullable": true },
          "lastName": { "type": "string", "nullable": true },
          "vas": { "type": "number", "description": "Vow Alignment Score" }
        }
      },
      "ArtifactManifest": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string", "enum": ["MICRO_APP", "CHAOS_CARD"] },
          "name": { "type": "string" },
          "description": { "type": "string" }
        }
      },
      "IntegrationConfigurationRequest": {
        "type": "object",
        "properties": {
          "integrationTypeId": { "type": "string", "format": "uuid" },
          "name": { "type": "string" },
          "configDetails": { "type": "object" }
        },
        "required": ["integrationTypeId", "name", "configDetails"]
      },
      "IntegrationUpdateRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "configDetails": { "type": "object" },
          "status": { "type": "string", "enum": ["active", "inactive", "error"] }
        }
      },
      "ConfiguredIntegration": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "status": { "type": "string", "enum": ["active", "inactive", "error"] },
          "manifest": { "type": "object" }
        }
      },
       "PulseState": {
        "type": "object",
        "properties": {
          "narrative": { "type": "string", "nullable": true },
          "phase": { "type": "string", "enum": ["CREST", "TROUGH", "EQUILIBRIUM"], "nullable": true },
          "value": { "type": "number", "format": "float", "nullable": true }
        }
      },
       "PulseProfile": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "userId": { "type": "string" },
          "baselineLuck": { "type": "number" },
          "amplitude": { "type": "number" },
          "frequency": { "type": "number" },
          "phaseOffset": { "type": "number" },
          "consecutiveLosses": { "type": "integer" },
          "lastEventTimestamp": { "type": "string", "format": "date-time" }
        }
      }
    }
  }
}
```