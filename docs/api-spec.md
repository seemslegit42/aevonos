Here is the updated document: docs/API/PUBLIC-API-SPEC.md.This document provides the formal OpenAPI 3.0 specification for the ΛΞVON OS Public API. It details the endpoints, data models, authentication methods, and error handling, serving as the definitive contract for external developers and services interacting with the platform.ΛΞVON OS: Public API SpecificationVersion: 1.0.0Description: The official Public API for ΛΞVON OS, the Intelligent Operating System for SMBs. This RESTful API allows external applications to seamlessly integrate with ΛΞVON OS functionalities, enabling AI-powered task delegation, workflow orchestration, secure data synchronization, and access to core platform intelligence.1. General API Information{
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
      "url": "http://localhost:3000/api/v1",
      "description": "Local Development Endpoint (Next.js API Routes)"
    }
  ],
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "tags": [
    {
      "name": "Authentication",
      "description": "User identity and session management."
    },
    {
      "name": "Users",
      "description": "Management of user profiles and preferences."
    },
    {
      "name": "Workspaces",
      "description": "Management of tenant workspaces and their configurations."
    },
    {
      "name": "BEEP",
      "description": "Natural language interaction and AI assistant capabilities."
    },
    {
      "name": "Workflows",
      "description": "Loom Studio workflow definitions and execution management (orchestrated by LangGraph)."
    },
    {
      "name": "Agents",
      "description": "Deployment and monitoring of AI agents."
    },
    {
      "name": "CRM",
      "description": "Management of contacts and customer data."
    },
    {
      "name": "Security",
      "description": "Aegis security alerts, threat intelligence, and baseline management."
    },
    {
      "name": "Billing",
      "description": "Management of plans, subscriptions, and 'Agent Actions' usage."
    },
    {
      "name": "MicroApps",
      "description": "Discovery and interaction with modular Micro-Apps."
    },
    {
      "name": "Integrations",
      "description": "Management of third-party service connections."
    }
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
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Authentication successful.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          "401": {
            "description": "Invalid credentials."
          }
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
              "schema": {
                "$ref": "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User and workspace created successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          "409": {
            "description": "User with email already exists."
          }
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
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized."
          }
        }
      },
      "put": {
        "tags": ["Users"],
        "summary": "Update the authenticated user's profile.",
        "operationId": "updateCurrentUser",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UserUpdateRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "User profile updated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "400": {
            "description": "Invalid input."
          }
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
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Workspace"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized."
          }
        }
      }
    },
    "/beep/command": {
      "post": {
        "tags": ["BEEP"],
        "summary": "Send a natural language command to BEEP for processing.",
        "operationId": "sendBeepCommand",
        "description": "BEEP (Behavioral Event & Execution Processor) processes natural language, understands intent, and orchestrates actions across the OS. This endpoint allows sending commands and receiving BEEP's response.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "command": {
                    "type": "string",
                    "description": "The natural language command for BEEP.",
                    "example": "create a new project task for site inspection at '123 Main St' due next Friday and assign it to John Doe"
                  },
                  "context": {
                    "type": "object",
                    "description": "Optional context for BEEP, e.g., current active Micro-App, user's current view.",
                    "nullable": true
                  }
                },
                "required": ["command"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "BEEP's response to the command.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "response": {
                      "type": "string",
                      "description": "BEEP's natural language response or confirmation.",
                      "example": "Task 'Site inspection at 123 Main St' created successfully and assigned to John Doe."
                    },
                    "actionTriggered": {
                      "type": "object",
                      "description": "Details of any direct actions triggered by BEEP (e.g., task ID, workflow ID).",
                      "nullable": true
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid command or context."
          }
        }
      }
    },
    "/workflows": {
      "get": {
        "tags": ["Workflows"],
        "summary": "Retrieve a list of all defined Loom Studio workflows.",
        "operationId": "listWorkflows",
        "description": "Fetches definitions and configurations for workflows that can be triggered or managed.",
        "responses": {
          "200": {
            "description": "A list of workflow definitions.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/WorkflowDefinition"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Workflows"],
        "summary": "Create a new Loom Studio workflow definition (possibly scaffolded by BEEP).",
        "operationId": "createWorkflow",
        "description": "Allows defining a new workflow, where the 'definition' field could contain the LangGraph JSON representation or a simplified schema.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/WorkflowCreationRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Workflow created successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/WorkflowDefinition"
                }
              }
            }
          },
          "400": {
            "description": "Invalid workflow definition."
          }
        }
      }
    },
    "/workflows/{workflowId}/run": {
      "post": {
        "tags": ["Workflows"],
        "summary": "Trigger a specific workflow execution.",
        "operationId": "triggerWorkflowRun",
        "description": "Initiates a run for a specified workflow. The `trigger_payload` will be passed to the workflow engine.",
        "parameters": [
          {
            "name": "workflowId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "description": "UUID of the workflow to execute."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "description": "The payload to pass to the workflow run (e.g., new contact data, event details).",
                "additionalProperties": true
              }
            }
          }
        },
        "responses": {
          "202": {
            "description": "Workflow run initiated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/WorkflowRunSummary"
                }
              }
            }
          },
          "404": {
            "description": "Workflow not found."
          },
          "400": {
            "description": "Invalid trigger payload."
          }
        }
      }
    },
    "/workflows/runs": {
      "get": {
        "tags": ["Workflows"],
        "summary": "Monitor active and historical workflow runs.",
        "operationId": "listWorkflowRuns",
        "description": "Retrieves real-time status and history for workflow executions. Can be filtered by status or workflow.",
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "description": "Filter runs by status (e.g., 'pending', 'running', 'completed', 'failed').",
            "required": false,
            "schema": {
              "type": "string",
              "enum": ["pending", "running", "completed", "failed", "paused"]
            }
          },
          {
            "name": "workflowId",
            "in": "query",
            "description": "Filter runs by a specific workflow UUID.",
            "required": false,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "A list of workflow run instances.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/WorkflowRunInstance"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/contacts": {
      "get": {
        "tags": ["CRM"],
        "summary": "Retrieve a list of contacts.",
        "operationId": "listContacts",
        "description": "Fetches contacts associated with the current tenant.",
        "responses": {
          "200": {
            "description": "A list of contacts.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Contact"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["CRM"],
        "summary": "Create a new contact.",
        "operationId": "createContact",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ContactCreationRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Contact created successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Contact"
                }
              }
            }
          },
          "400": {
            "description": "Invalid contact data."
          },
          "409": {
            "description": "Contact with this email already exists for this tenant."
          }
        }
      }
    },
    "/contacts/{contactId}": {
      "get": {
        "tags": ["CRM"],
        "summary": "Retrieve a specific contact by ID.",
        "operationId": "getContactById",
        "parameters": [
          {
            "name": "contactId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "description": "UUID of the contact to retrieve."
          }
        ],
        "responses": {
          "200": {
            "description": "Contact details.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Contact"
                }
              }
            }
          },
          "404": {
            "description": "Contact not found."
          }
        }
      },
      "put": {
        "tags": ["CRM"],
        "summary": "Update a specific contact by ID.",
        "operationId": "updateContact",
        "parameters": [
          {
            "name": "contactId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "description": "UUID of the contact to update."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ContactUpdateRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Contact updated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Contact"
                }
              }
            }
          },
          "400": {
            "description": "Invalid contact data."
          },
          "404": {
            "description": "Contact not found."
          }
        }
      },
      "delete": {
        "tags": ["CRM"],
        "summary": "Delete a specific contact by ID.",
        "operationId": "deleteContact",
        "parameters": [
          {
            "name": "contactId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "description": "UUID of the contact to delete."
          }
        ],
        "responses": {
          "204": {
            "description": "Contact deleted successfully."
          },
          "404": {
            "description": "Contact not found."
          }
        }
      }
    },
    "/security/alerts": {
      "get": {
        "tags": ["Security"],
        "summary": "Retrieve security alerts generated by Aegis.",
        "operationId": "listSecurityAlerts",
        "description": "Provides alerts for anomalous user behavior or system threats, with plain English explanations from BEEP.",
        "responses": {
          "200": {
            "description": "A list of security alerts.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/SecurityAlert"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/security/threat-feeds": {
      "put": {
        "tags": ["Security"],
        "summary": "Configure threat intelligence feed sources for Aegis.",
        "operationId": "configureThreatFeeds",
        "description": "Allows IT Managers to add, remove, and manage URLs/identifiers for threat intelligence feeds that Aegis consumes.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "feeds": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "format": "url"
                    },
                    "description": "List of URLs or identifiers for threat intelligence feeds."
                  }
                },
                "required": ["feeds"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Threat intelligence feeds updated successfully."
          },
          "400": {
            "description": "Invalid feed configuration."
          }
        }
      }
    },
    "/billing/usage/agent-actions": {
      "get": {
        "tags": ["Billing"],
        "summary": "Retrieve 'Agent Actions' usage for the current billing period.",
        "operationId": "getAgentActionsUsage",
        "description": "Provides data on the number of AI-driven 'Agent Actions' consumed by the current workspace.",
        "responses": {
          "200": {
            "description": "Agent Actions usage details.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "currentPeriod": {
                      "type": "string",
                      "format": "date"
                    },
                    "totalActionsUsed": {
                      "type": "integer",
                      "example": 7500
                    },
                    "planLimit": {
                      "type": "integer",
                      "example": 10000
                    },
                    "planTier": {
                      "type": "string",
                      "example": "Pro"
                    },
                    "overageEnabled": {
                      "type": "boolean",
                      "example": true
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized."
          }
        }
      }
    },
    "/microapps": {
      "get": {
        "tags": ["MicroApps"],
        "summary": "Retrieve a list of available Micro-Apps.",
        "operationId": "listMicroApps",
        "description": "Fetches metadata for all plug-and-play Micro-Apps available for the current workspace/plan.",
        "responses": {
          "200": {
            "description": "A list of Micro-App manifests.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MicroAppManifest"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/agents": {
      "get": {
        "tags": ["Agents"],
        "summary": "Retrieve a list of deployed AI agents.",
        "operationId": "listAgents",
        "description": "Fetches metadata and status for all AI agents currently deployed and managed within the workspace.",
        "responses": {
          "200": {
            "description": "A list of AI agent details.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Agent"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Agents"],
        "summary": "Deploy a new AI agent.",
        "operationId": "deployAgent",
        "description": "Allows for the deployment of a new AI agent with specified configurations, likely triggered via Loom Studio or BEEP.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AgentDeploymentRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Agent deployed successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Agent"
                }
              }
            }
          },
          "400": {
            "description": "Invalid agent deployment request."
          }
        }
      }
    },
    "/integrations": {
      "get": {
        "tags": ["Integrations"],
        "summary": "Retrieve a list of available third-party integrations.",
        "operationId": "listIntegrations",
        "description": "Fetches metadata for all supported third-party service integrations (e.g., Slack, Stripe, Google Workspace).",
        "responses": {
          "200": {
            "description": "A list of integration manifests.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IntegrationManifest"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Integrations"],
        "summary": "Configure a new third-party integration.",
        "operationId": "createIntegration",
        "description": "Allows administrators to configure and activate a new third-party service integration.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IntegrationConfigurationRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Integration configured successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IntegrationInstance"
                }
              }
            }
          },
          "400": {
            "description": "Invalid integration configuration."
          }
        }
      }
    },
    "/integrations/{integrationId}": {
      "get": {
        "tags": ["Integrations"],
        "summary": "Retrieve details of a configured integration.",
        "operationId": "getIntegration",
        "parameters": [
          {
            "name": "integrationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "description": "UUID of the integration instance."
          }
        ],
        "responses": {
          "200": {
            "description": "Integration details.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IntegrationInstance"
                }
              }
            }
          },
          "404": {
            "description": "Integration not found."
          }
        }
      },
      "put": {
        "tags": ["Integrations"],
        "summary": "Update an existing third-party integration configuration.",
        "operationId": "updateIntegration",
        "parameters": [
          {
            "name": "integrationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "description": "UUID of the integration instance to update."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IntegrationConfigurationRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Integration updated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IntegrationInstance"
                }
              }
            }
          },
          "400": {
            "description": "Invalid integration data."
          },
          "404": {
            "description": "Integration not found."
          }
        }
      },
      "delete": {
        "tags": ["Integrations"],
        "summary": "Deactivate or remove a third-party integration.",
        "operationId": "deleteIntegration",
        "parameters": [
          {
            "name": "integrationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "description": "UUID of the integration instance to delete."
          }
        ],
        "responses": {
          "204": {
            "description": "Integration deleted successfully."
          },
          "404": {
            "description": "Integration not found."
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT-based authentication (OAuth2) issued upon successful login."
      }
    },
    "schemas": {
      "LoginRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "example": "user@aevonos.com"
          },
          "password": {
            "type": "string",
            "format": "password",
            "example": "SecurePa$$word123"
          }
        },
        "required": ["email", "password"]
      },
      "RegisterRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "example": "newuser@aevonos.com"
          },
          "password": {
            "type": "string",
            "format": "password",
            "example": "SecurePa$$word123"
          },
          "firstName": {
            "type": "string",
            "example": "Jane"
          },
          "lastName": {
            "type": "string",
            "example": "Doe"
          },
          "workspaceName": {
            "type": "string",
            "example": "Acme Corp"
          }
        },
        "required": ["email", "password", "workspaceName"]
      },
      "AuthResponse": {
        "type": "object",
        "properties": {
          "accessToken": {
            "type": "string",
            "description": "JWT Access Token.",
            "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          },
          "tokenType": {
            "type": "string",
            "example": "Bearer"
          },
          "expiresIn": {
            "type": "integer",
            "description": "Token expiration time in seconds.",
            "example": 3600
          },
          "user": {
            "$ref": "#/components/schemas/User"
          }
        }
      },
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "description": "Internal database ID."
          },
          "uuid": {
            "type": "string",
            "format": "uuid",
            "description": "Publicly exposed unique identifier for the user."
          },
          "email": {
            "type": "string",
            "format": "email"
          },
          "firstName": {
            "type": "string",
            "nullable": true
          },
          "lastName": {
            "type": "string",
            "nullable": true
          },
          "lastLoginAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["id", "uuid", "email", "createdAt", "updatedAt"]
      },
      "UserUpdateRequest": {
        "type": "object",
        "properties": {
          "firstName": {
            "type": "string",
            "nullable": true
          },
          "lastName": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "format": "email",
            "nullable": true
          }
        }
      },
      "Workspace": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "description": "Internal database ID."
          },
          "uuid": {
            "type": "string",
            "format": "uuid",
            "description": "Publicly exposed unique identifier for the workspace."
          },
          "name": {
            "type": "string",
            "example": "Acme Inc."
          },
          "planTier": {
            "type": "string",
            "enum": ["free", "pro", "scale"],
            "example": "pro"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["id", "uuid", "name", "planTier", "createdAt", "updatedAt"]
      },
      "WorkflowDefinition": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "description": "Internal database ID."
          },
          "uuid": {
            "type": "string",
            "format": "uuid",
            "description": "Publicly exposed unique identifier for the workflow."
          },
          "tenantId": {
            "type": "integer",
            "description": "Internal database ID of the associated tenant."
          },
          "name": {
            "type": "string",
            "example": "New Client Onboarding Process"
          },
          "isActive": {
            "type": "boolean",
            "example": true
          },
          "triggerType": {
            "type": "string",
            "enum": ["api", "schedule", "event"],
            "example": "api"
          },
          "definition": {
            "type": "object",
            "description": "JSONB representation of the workflow graph (e.g., LangGraph JSON structure for nodes, edges, logic).",
            "additionalProperties": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          "tenantId": {
            "type": "integer",
            "description": "Internal database ID of the associated tenant."
          },
          "email": {
            "type": "string",
            "format": "email",
            "nullable": true
          },
          "firstName": {
            "type": "string",
            "nullable": true
          },
          "lastName": {
            "type": "string",
            "nullable": true
          },
          "phone": {
            "type": "string",
            "nullable": true
          },
          "customProperties": {
            "type": "object",
            "description": "Arbitrary key-value pairs for custom contact fields (JSONB equivalent).",
            "additionalProperties": true,
            "example": { "leadSource": "Website Form", "industry": "Retail" }
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["id", "uuid", "tenantId", "createdAt", "updatedAt"]
      },
      "ContactCreationRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "nullable": true
          },
          "firstName": {
            "type": "string",
            "nullable": true
          },
          "lastName": {
            "type": "string",
            "nullable": true
          },
          "phone": {
            "type": "string",
            "nullable": true
          },
          "customProperties": {
            "type": "object",
            "description": "Arbitrary key-value pairs for custom contact fields.",
            "additionalProperties": true,
            "nullable": true
          }
        }
      },
      "ContactUpdateRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "nullable": true
          },
          "firstName": {
            "type": "string",
            "nullable": true
          },
          "lastName": {
            "type": "string",
            "nullable": true
          },
          "phone": {
            "type": "string",
            "nullable": true
          },
          "customProperties": {
            "type": "object",
            "description": "Arbitrary key-value pairs for custom contact fields.",
            "additionalProperties": true,
            "nullable": true
          }
        }
      },
      "SecurityAlert": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "description": "Publicly exposed unique identifier for the alert."
          },
          "tenantId": {
            "type": "integer",
            "description": "Internal database ID of the associated tenant."
          },
          "type": {
            "type": "string",
            "description": "Type of security alert (e.g., 'Anomalous Login', 'Permission Creep').",
            "example": "Anomalous Login"
          },
          "explanation": {
            "type": "string",
            "description": "Plain English explanation from BEEP.",
            "example": "Login from an unusual location (e.g., Russia) for this user, outside of typical work hours."
          },
          "riskLevel": {
            "type": "string",
            "enum": ["low", "medium", "high", "critical"],
            "example": "high"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          },
          "actionableOptions": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Suggested actions for the user (e.g., 'Lock Account', 'Dismiss Alert')."
          }
        },
        "required": ["id", "tenantId", "type", "explanation", "riskLevel", "timestamp"]
      },
      "MicroAppManifest": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "description": "Unique identifier for the Micro-App."
          },
          "name": {
            "type": "string",
            "description": "Display name of the Micro-App (e.g., 'Security Surface Scan')."
          },
          "description": {
            "type": "string",
            "description": "Brief description of the Micro-App's functionality."
          },
          "iconUrl": {
            "type": "string",
            "format": "url",
            "description": "URL to the Micro-App's icon (or direct SVG if embedded in manifest)."
          },
          "permissionsRequired": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "List of permissions required to use this Micro-App."
          },
          "routingPath": {
            "type": "string",
            "description": "Internal routing path to launch this Micro-App within the Canvas."
          },
          "contextAwareCapabilities": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Capabilities for reacting to global state, agent telemetry, etc."
          }
        },
        "required": ["id", "name", "description", "routingPath"]
      },
      "Agent": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "description": "Publicly exposed unique identifier for the agent."
          },
          "tenantId": {
            "type": "integer",
            "description": "Internal database ID of the associated tenant."
          },
          "name": {
            "type": "string",
            "example": "Market Research Agent"
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "status": {
            "type": "string",
            "enum": ["active", "idle", "processing", "paused", "error"],
            "example": "active"
          },
          "assignedWorkflowId": {
            "type": "string",
            "format": "uuid",
            "description": "UUID of the workflow this agent is currently assigned to, if any.",
            "nullable": true
          },
          "lastActivityAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["id", "tenantId", "name", "status", "createdAt", "updatedAt"]
      },
      "AgentDeploymentRequest": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "example": "Market Research Agent"
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "configuration": {
            "type": "object",
            "description": "JSON object containing agent-specific configuration (e.g., goals, tools, LLM model).",
            "additionalProperties": true
          }
        },
        "required": ["name", "configuration"]
      },
      "IntegrationManifest": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "description": "Unique identifier for the integration type (e.g., 'slack', 'stripe')."
          },
          "name": {
            "type": "string",
            "description": "Display name of the integration (e.g., 'Slack', 'Google Workspace')."
          },
          "description": {
            "type": "string",
            "description": "Brief description of what this integration provides."
          },
          "iconUrl": {
            "type": "string",
            "format": "url",
            "description": "URL to the integration's icon."
          },
          "authMethod": {
            "type": "string",
            "enum": ["oauth2", "api_key", "webhook"],
            "description": "Authentication method required for this integration."
          },
          "setupGuideUrl": {
            "type": "string",
            "format": "url",
            "description": "URL to a guide on how to set up this integration."
          }
        },
        "required": ["id", "name", "description", "authMethod"]
      },
      "IntegrationConfigurationRequest": {
        "type": "object",
        "properties": {
          "integrationTypeId": {
            "type": "string",
            "format": "uuid",
            "description": "The UUID of the integration type to configure (from IntegrationManifest)."
          },
          "name": {
            "type": "string",
            "description": "A user-defined name for this integration instance (e.g., 'My Marketing Slack')."
          },
          "configDetails": {
            "type": "object",
            "description": "JSON object containing integration-specific configuration details (e.g., API key, webhook URL, OAuth tokens).",
            "additionalProperties": true
          }
        },
        "required": ["integrationTypeId", "name", "configDetails"]
      },
      "IntegrationInstance": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "description": "Unique identifier for this configured integration instance."
          },
          "tenantId": {
            "type": "integer",
            "description": "Internal database ID of the associated tenant."
          },
          "integrationTypeId": {
            "type": "string",
            "format": "uuid",
            "description": "The UUID of the integration type (from IntegrationManifest)."
          },
          "name": {
            "type": "string",
            "description": "User-defined name for this integration instance."
          },
          "status": {
            "type": "string",
            "enum": ["active", "inactive", "error"],
            "example": "active"
          },
          "configDetails": {
            "type": "object",
            "description": "JSON object containing integration-specific configuration details (sensitive info may be redacted).",
            "additionalProperties": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["id", "tenantId", "integrationTypeId", "name", "status", "createdAt", "updatedAt"]
      }
    }
  }
}
3. Implementation Notes (Fullstack Next.js, Prisma, PostgreSQL, LangGraph)Next.js API Routes (Backend): The API endpoints will primarily be implemented as Edge Functions or Serverless Functions within Next.js's pages/api or app/api directory structure. This allows for serverless deployment on platforms like Vercel.Prisma (ORM for PostgreSQL): Data persistence will be managed using Prisma. Each API route handler will utilize Prisma Client to interact with the PostgreSQL database. Prisma's type-safe queries align well with the TypeScript-first approach. Multi-tenancy (tenant_id) will be strictly enforced at the Prisma query level for data isolation.PostgreSQL (Database): The primary database will be PostgreSQL, following the defined schema principles (multi-tenancy via tenant_id, UUIDs for public IDs, JSONB for flexible data like workflow.definition and contact.customProperties). This provides robust, scalable, and transactional data storage.LangGraph (AI Workflow Orchestration):The workflow.definition field within the database will store the serialized representation of LangGraph-based workflows.The /workflows/{workflowId}/run endpoint will trigger these LangGraph workflows. The backend API route will instantiate and execute the LangGraph definition, passing the trigger_payload as input.Loom Studio's visual builder will generate/manipulate these LangGraph definitions.BEEP's agentic orchestration will involve dynamically constructing or selecting LangGraph workflows for execution. LangGraph's multi-actor collaboration and state-based nature are crucial for BEEP's ability to coordinate complex agent teams and persist context.Authentication: JWTs, issued upon successful login, will be validated by the Next.js API routes. The tenant_id embedded within the JWT will be extracted and used for all database queries to ensure strict data isolation in the multi-tenant PostgreSQL schema.Error Handling: Standard HTTP status codes (e.g., 400, 401, 404, 409) will be used, with clear error messages in the response body.