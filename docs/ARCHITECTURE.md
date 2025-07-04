# ΛΞVON OS - Architecture Design Document
Document Version: 1.0
Date: 2025-07-03
Status: Canonized
Author: ARCHIVEX
Traceability: This document is the direct technical implementation of SRS-ΛΞVON-OS-v1.0.
1. Introduction
1.1 Purpose
This Architecture Design Document (ADD) provides a detailed, low-level design of the ΛΞVON OS V1.0 system. It expands upon the SRS by defining the precise API contracts, database schemas, and component interaction patterns. This document is the primary technical guide for the engineering team.
1.2 Scope
The scope covers the detailed design of all backend microservices, the frontend application structure, the complete database schema, and the security mechanisms governing their interaction.
2. System Architecture
2.1 Communication Patterns
The system employs two primary communication patterns:
Synchronous Request/Response: For most user-initiated actions, services communicate via synchronous RESTful API calls through the central API Gateway. This ensures immediate feedback to the user.
Asynchronous Event Streaming: For security monitoring and logging, services publish events to a message bus (e.g., Google Cloud Pub/Sub, or a managed Redis stream for V1). The aegis-service is the primary consumer of these events, allowing for decoupled, non-blocking security analysis.
2.2 API Gateway
The Next.js backend (acting as Backend-for-Frontend) serves as the API Gateway. It is the single entry point for all client requests. Its responsibilities are:
Authenticating incoming requests by validating the JWT.
Routing requests to the appropriate downstream microservice.
Aggregating responses from multiple services if required.
3. Detailed Service Designs
3.1 auth-service
Responsibilities: User authentication, session management, JWT issuance.
API Contract (OpenAPI 3.0 Snippet):
paths:
  /v1/auth/initiate:
    post:
      summary: Initiate a passwordless login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
      responses:
        '202':
          description: Acknowledged. Magic link/code sent.
  /v1/auth/complete:
    post:
      summary: Complete login with magic link/code
      requestBody:
        # ... schema for token/code
      responses:
        '200':
          description: Login successful, JWT returned.
          content:
            application/json:
              schema:
                properties:
                  jwt:
                    type: string
Data Ownership: User, AuthToken models.
3.2 beep-service
Responsibilities: NLU processing, agentic orchestration, personality matrix loading.
API Contract (OpenAPI 3.0 Snippet):
paths:
  /v1/beep/command:
    post:
      summary: Process a natural language command
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              properties:
                command_text:
                  type: string
                context: # "core_os" or "folly_instrument"
                  type: string
                canvas_state: # Snapshot of current Micro-App states
                  type: object
      responses:
        '200':
          description: Command executed, returns workflow result.
Dependencies: All other services (via LangGraph tool definitions), Genkit/Groq API.
3.3 obelisk-pay-service
Responsibilities: Atomic ΞCredit transactions, immutable ledger, Transmutation Tithe enforcement.
API Contract (OpenAPI 3.0 Snippet):
paths:
  /v1/ledger/transact:
    post:
      summary: Perform an internal ΞCredit transaction
      security:
        - serviceTokenAuth: [] # Service-to-service only
      requestBody:
        required: true
        content:
          application/json:
            schema:
              properties:
                from_user_id:
                  type: string
                to_user_id:
                  type: string
                amount:
                  type: integer
                memo:
                  type: string
      responses:
        '201':
          description: Transaction recorded.
Data Ownership: Transaction, UserWallet models.
4. Database Design
4.1 V1 Prisma Schema
The following is the definitive V1 schema.
// datasource db {
//   provider     = "postgresql"
//   url          = env("DATABASE_URL")
//   relationMode = "prisma"
// }

// generator client {
//   provider = "prisma-client-js"
// }

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sovereigntyClass String @default("INITIATE") // INITIATE, SOVEREIGN, ARCHITECT

  wallet      UserWallet?
  canvasState CanvasState?
  psycheState PsycheState?
  instances   MicroAppInstance[]
}

model UserWallet {
  id      String @id @default(cuid())
  userId  String @unique
  user    User   @relation(fields: [userId], references: [id])
  balance BigInt @default(1000) // Starting balance
}

model CanvasState {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
  layout Json // JSON representation of Micro-App positions and sizes
}

model MicroApp {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  developerId String
  instances   MicroAppInstance[]
}

model MicroAppInstance {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  microAppId String
  microApp   MicroApp @relation(fields: [microAppId], references: [id])
  state      Json     // Specific state for this user's instance of the app
  createdAt  DateTime @default(now())
}

model Transaction {
  id              String   @id @default(cuid())
  amount          BigInt
  memo            String
  fromUserId      String
  toUserId        String
  createdAt       DateTime @default(now())
  aegisSignature  String   // Signature from Aegis to verify integrity
}

model PsycheState {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  sreWave           Float    // Sine-Rhythm Engine value (-1.0 to 1.0)
  lossStreak        Int      @default(0)
  frustrationLevel  Float    @default(0.0) // Metric monitored by Aegis
  isThrottled       Boolean  @default(false)
}
5. Interaction Diagrams (Sequence)
5.1 User Login and Canvas Hydration
sequenceDiagram
    participant Client
    participant API Gateway (Next.js)
    participant auth-service
    participant canvas-service
    participant UserDB

    Client->>API Gateway (Next.js): POST /api/auth/complete (with code)
    API Gateway (Next.js)->>auth-service: POST /v1/auth/complete
    auth-service->>UserDB: Validate code, find User
    UserDB-->>auth-service: User record
    auth-service-->>API Gateway (Next.js): JWT
    API Gateway (Next.js)-->>Client: Set JWT in secure cookie

    Client->>API Gateway (Next.js): GET /api/canvas/state (with JWT)
    API Gateway (Next.js)->>canvas-service: GET /v1/canvas/state
    canvas-service->>UserDB: Fetch CanvasState and MicroAppInstances for user
    UserDB-->>canvas-service: Layout and instances data
    canvas-service-->>API Gateway (Next.js): Full canvas state
    API Gateway (Next.js)-->>Client: JSON response
    Client->>Client: Render Canvas and Micro-Apps
5.2 BEEP Command Execution
sequenceDiagram
    participant Client
    participant API Gateway (Next.js)
    participant beep-service
    participant LangGraph
    participant klepsydra-service

    Client->>API Gateway (Next.js): POST /api/beep/command (text: "Spin the wheel")
    API Gateway (Next.js)->>beep-service: POST /v1/beep/command
    beep-service->>LangGraph: Orchestrate workflow based on intent ("Folly Instrument Interaction")
    LangGraph->>klepsydra-service: GET /v1/folly/execute (instrument: "SpinForge")
    klepsydra-service->>klepsydra-service: Calculate outcome using SRE, Judas Algorithm
    klepsydra-service-->>LangGraph: Result (e.g., "{ win: true, amount: 500 }")
    LangGraph-->>beep-service: Final result
    beep-service-->>API Gateway (Next.js): Formatted natural language response
    API Gateway (Next.js)-->>Client: "The wheel lands on a gilded sigil. +500 Ξ."
6. Security Architecture
6.1 JWT Authentication Flow
Issuance: The auth-service issues a short-lived (15 min) JWT upon successful login. The JWT payload contains userId, email, and sovereigntyClass.
Client Storage: The JWT is stored in a secure, HttpOnly cookie on the client to prevent XSS attacks.
Validation: The API Gateway validates the JWT signature and expiration on every incoming request.
Downstream Propagation: The API Gateway forwards the validated JWT payload (as a simplified JSON header, not the full JWT) to the downstream microservices, which trust the gateway's validation. This prevents each service from needing to re-validate the signature.
This ADD provides the final layer of technical detail required for implementation. It is the definitive source for building ΛΞVON OS V1.0. Adherence to these specifications is mandatory.
