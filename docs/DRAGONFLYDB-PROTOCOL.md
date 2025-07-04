# ΛΞVON OS: DragonflyDB Integration Protocol
**Document Version:** 1.0
**Codename:** The Reflex Arc
**Status:** Canonized
**Author:** ARCHIVEX

---

### 1. Doctrinal Statement

If PostgreSQL is the immutable, stone-carved Ledger of our world, DragonflyDB is its nervous system. It is the Reflex Arc of ΛΞVON OS—a high-performance, in-memory datastore designed for the ephemeral, the immediate, and the frequently accessed.

The integration of DragonflyDB is not to replace our persistent database, but to augment it. Its purpose is to handle the high-traffic, low-latency operations required to make the Canvas feel alive, the economic engine feel responsive, and the user's session feel seamless. It is a core component in our war against latency.

---

### 2. Strategic Role & Integration Philosophy

* **Primary Function:** To serve as a high-speed cache and real-time data store for frequently accessed, non-permanent, or transient data.
* **Core Principle:** Offload high-volume read operations from the primary PostgreSQL database to reduce load and improve response times for critical services.
* **Data Strategy (Write-Through Caching):** For data that requires both speed and persistence (e.g., PsycheState), we will employ a **write-through** strategy. Data is written to DragonflyDB and PostgreSQL simultaneously. Reads are served from DragonflyDB for speed, guaranteeing that the cache is always fresh while the persistent database remains the ultimate source of truth.

---

### 3. V1 Implementation & Use Cases

DragonflyDB will be integrated into the following core services for V1:

#### 3.1 `klepsydra-service` (PsycheState Caching)
* **Problem:** The KLEPSYDRA engine needs to read a user's `PsycheState` (SRE wave, loss streak, etc.) on every single Folly Instrument interaction. Hitting the main database every time is inefficient and introduces latency.
* **Solution:** The complete `PsycheState` object for every active user will be cached in DragonflyDB. The `klepsydra-service` will read directly from this cache during its calculations. When the state is updated (e.g., a loss increases the `lossStreak`), the service writes the new state to both DragonflyDB and PostgreSQL.
* **Key:** `psyche:{userId}`

#### 3.2 `canvas-service` (Transient State Management)
* **Problem:** The exact position, size, and z-index of a user's Micro-Apps change frequently. Persisting every minor UI adjustment to PostgreSQL is unnecessary overhead.
* **Solution:** The `canvas-service` will store the user's live `layout` JSON object in DragonflyDB. It will be updated in real-time as the user manipulates their Canvas. The state will be persisted to PostgreSQL only periodically (e.g., every 5 minutes) or on session logout.
* **Key:** `canvas:{userId}`

#### 3.3 `auth-service` (Session Caching)
* **Problem:** Validating a user's session on every API call requires checking their status and permissions. This can create a bottleneck at the database level.
* **Solution:** Active user session data, including permissions and `Sovereignty Class`, will be cached in DragonflyDB with a short Time-to-Live (TTL) that mirrors the JWT expiration. The API Gateway can query this cache for validation, which is orders of magnitude faster than a database lookup.
* **Key:** `session:{userId}`

#### 3.4 `beep-service` (Conversational Context)
* **Problem:** To resolve ambiguity, BEEP needs to remember the last few turns of a conversation.
* **Solution:** A transcript of the last 5 user commands and BEEP responses will be stored in DragonflyDB as a list. This allows the Contextualization Engine to quickly retrieve recent history when processing a new command.
* **Key:** `convo_history:{userId}`

---

### 4. Technical Implementation

#### 4.1 Key-Value Schema
While DragonflyDB is schema-less, we will enforce a strict `service:{key}:{userId}` naming convention for all keys to ensure clarity and prevent collisions. The value will typically be a serialized JSON string.

#### 4.2 Client Integration
* All backend services will use a compatible Redis client library (e.g., `ioredis` for Node.js) to connect to the DragonflyDB instance.
* A centralized connection manager will be implemented to handle the client pool and credentials.

#### 4.3 Cache-Aside Pattern (Conceptual Code)
The following demonstrates the cache-aside pattern that services like `klepsydra-service` will use to read data.

```typescript
// Conceptual code for klepsydra-service

import { dragonflyClient } from './connections';
import { prismaClient } from './connections';

async function getPsycheState(userId: string): Promise<PsycheState> {
  const cacheKey = `psyche:${userId}`;

  // 1. Try to get the state from DragonflyDB first
  const cachedState = await dragonflyClient.get(cacheKey);

  if (cachedState) {
    // Cache hit: parse and return the data immediately
    return JSON.parse(cachedState) as PsycheState;
  } else {
    // Cache miss: get the data from the primary database
    const dbState = await prismaClient.psycheState.findUnique({
      where: { userId },
    });

    if (dbState) {
      // 2. Write the retrieved data back to the cache for next time
      await dragonflyClient.set(cacheKey, JSON.stringify(dbState));
    }

    return dbState;
  }
}
```