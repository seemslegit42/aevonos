
# ΛΞVON OS: Core Persistence Protocol
Document Version: 1.0
Codename: The Ledger of Record
Status: Canonized
Author: ARCHIVEX

## 1. Doctrinal Statement
Every world needs an unchangeable history, a ledger of record carved in stone. For ΛΞVON OS, this is the Core Persistence Stack. It is the ultimate source of truth for all foundational data—user identities, economic ledgers, and the immutable logs of Aegis.

This is not the system's short-term memory or its reflexes; that is the role of DragonflyDB. This is the system's soul. Its architecture is therefore predicated on three non-negotiable principles: absolute integrity, type-safe precision, and scalable performance. This protocol defines the components and laws governing this most critical layer of our infrastructure.

## 2. The Triumvirate of Persistence
Our core persistence layer is a triumvirate of technologies, each chosen for a specific, critical purpose.

### 2.1 PostgreSQL (Serverless): The Foundation
Role: The relational database engine. It is the vault where all canonical data resides.

Rationale: We use PostgreSQL for its proven robustness, extensibility, and unwavering commitment to data integrity. Its powerful feature set provides the foundation needed for a complex system like ours.

Serverless Model: We utilize a managed, serverless PostgreSQL provider. This is a strategic choice to abstract away the complexities of database administration (patching, scaling, backups). It allows our engineering team to focus exclusively on building the OS, not on maintaining database servers.

### 2.2 Prisma: The Type-Safe Bridge
Role: The ORM (Object-Relational Mapper) that our Node.js microservices use to communicate with the PostgreSQL database.

Rationale: Prisma is mandated for all core database interactions for two key reasons:

Absolute Type Safety: Prisma generates a client based on our database schema, providing fully typed query results. This eliminates an entire class of data-related bugs at compile time and ensures precision in our code.

Standardized Migrations: Prisma provides a robust and predictable workflow for schema migrations (prisma migrate). This ensures that changes to the database schema are version-controlled, repeatable, and safe to deploy across our environments, as detailed in the Deployment Runbook.

### 2.3 Prisma Accelerate: The Performance Layer
Role: A high-performance infrastructure layer that sits between our services and the database. It is active by default for all connections.

Rationale: Prisma Accelerate solves two critical problems inherent in a serverless, microservices-based architecture:

Connection Pooling: In a serverless environment, functions can spin up and down rapidly, each trying to open its own database connection. This can quickly exhaust the database's connection limit. Accelerate maintains a persistent, global pool of connections, ensuring our services can scale without overwhelming the database.

Global Query Caching: Accelerate automatically caches the results of frequently executed database queries at the edge, physically close to our services. This dramatically reduces database load and provides millisecond response times for common read operations, complementing DragonflyDB's application-level caching.

## 3. Architectural Integration & Data Flow
The flow of a request from a service to the database is precise and consistent:

Service Logic -> Prisma Client -> Prisma Accelerate -> PostgreSQL Database

A microservice (e.g., obelisk-pay-service) needs to query data.

It uses the auto-generated Prisma Client to build a type-safe query.

The Prisma Client, configured to use Accelerate, sends the request not directly to the database, but to the Prisma Accelerate endpoint.

Accelerate checks if it has a valid, cached response for this query.

Cache Hit: It returns the cached data instantly.

Cache Miss: It forwards the query to the PostgreSQL database using its pooled connection, receives the result, caches it for future requests, and then returns it to the service.

## 4. Architectural Mandate: Root-Level Schema
**The Law**: The `prisma` directory, containing the `schema.prisma` file and its associated migrations, MUST reside in the project's root. It MUST NOT be placed inside the `src/` directory.

**Rationale**: This is a non-negotiable architectural decision to enforce a clear, logical separation between the application's source code (`src/`) and the database's schema definitions. All build scripts (`package.json`), ORM configurations (`src/lib/prisma.ts`), and deployment processes MUST explicitly target this root-level location. Any deviation from this is a critical error.

## 5. The Mandate of Atomicity
Given that this stack handles our most critical financial and identity data, all operations that involve multiple, related database writes must be executed within a transaction to ensure atomicity.

The Law: Any workflow that could be left in an inconsistent state if a step fails (e.g., debiting one user's wallet and crediting another) must be wrapped in a prisma.$transaction() block.

Example (from obelisk-pay-service):

```typescript
// This ensures that both the debit and the credit must succeed, or neither will.
const [debit, credit] = await prisma.$transaction([
  // First operation: Decrement sender's balance
  prisma.userWallet.update({
    where: { userId: fromUserId },
    data: { balance: { decrement: amount } },
  }),
  // Second operation: Increment receiver's balance
  prisma.userWallet.update({
    where: { userId: toUserId },
    data: { balance: { increment: amount } },
  }),
]);
```

This protocol ensures that our core data layer is robust, performant, and managed with the precision required for an OS of this magnitude. It is the unyielding foundation upon which all other systems are built.
