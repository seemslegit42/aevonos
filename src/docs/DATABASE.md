# ΛΞVON OS: Data Layer - Database Schema
1. Database System & Core Principles
ΛΞVON OS utilizes PostgreSQL as its primary database system, serving as the robust and scalable foundation for all operational data. Our database design is governed by the following core principles:
Multi-Tenancy (Schema-per-Tenant): Every table includes a tenant_id column. This key is used in every query to ensure strict data isolation between workspaces. It is indexed on all tables for performance.
UUIDs for Public IDs: Primary keys are standard auto-incrementing integers (id) for performance. However, a uuid column is included for any record that needs to be exposed externally via the API, preventing enumeration attacks.
JSONB for Flexibility: JSONB data types are used for storing unstructured or semi-structured data like custom fields or workflow step parameters. This allows for flexibility without requiring schema migrations for minor changes.
Timestamps: Standard created_at and updated_at columns are present on all tables for auditing and tracking.
2. Database Stack
ORM: Prisma is the chosen ORM for all TypeScript services, providing a type-safe client, powerful migrations, and excellent developer experience.
Prisma Accelerate: This is active and mandated for use, providing managed connection pooling and global caching (edge caching with TTL and SWR per-query controls).
Deployment: PostgreSQL is configured for a serverless environment, optimizing for scalability and cost-effectiveness on platforms like Vercel or GCP.
Vector Search: The pgvector extension is enabled and utilized within PostgreSQL for storing and querying vector embeddings, essential for RAG (Retrieval Augmented Generation) and AI memory features.
3. Schema Designs: Tables, Columns, and Constraints
3.1. Workspace Service Schema
This schema manages tenants, users, roles, and their relationships.
tenants table: Stores the root workspace/organization for each customer.
