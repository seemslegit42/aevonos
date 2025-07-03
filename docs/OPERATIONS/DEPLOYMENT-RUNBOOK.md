# ΛΞVON OS: Operations - Deployment Runbook

## 1. Introduction: Deploying the Agentic OS
This runbook details the process for deploying ΛΞVON OS across its various environments. Our deployment strategy aligns with the "silence of true automation" by maximizing automation, ensuring consistency, and integrating security checks at every stage. This document complements the docs/DEVOPS/CI-CD-STRATEGY.md by providing the operational steps.

## 2. Deployment Environments
ΛΞVON OS utilizes the following deployment environments:

-   **Development (Dev)**:
    -   **Purpose**: Individual developer sandboxes for feature development and rapid iteration.
    -   **Trigger**: Local builds, feature branch pushes (Vercel Preview Deployments).
    -   **Characteristics**: Ephemeral backend environments, potentially simplified service configurations.
-   **Staging (Stg)**:
    -   **Purpose**: Integration testing, QA validation, pre-production UAT (User Acceptance Testing), and performance testing. Mimics production as closely as possible.
    -   **Trigger**: Automated deployment on merge to `main` branch.
    -   **Characteristics**: Full environment with all services, integrations, and production-like data (sanitized).
-   **Production (Prod)**:
    -   **Purpose**: Live environment serving end-users.
    -   **Trigger**: Manual approval after successful Staging validation and release candidate tagging.
    -   **Characteristics**: High-availability infrastructure, robust monitoring, strict security controls.

## 3. Prerequisites & Access
Before initiating any deployment, ensure the following:

-   **Access Credentials**:
    -   GitHub access with appropriate repository permissions.
    -   Vercel access with deployment permissions for the frontend project.
    -   GCP (Google Cloud Platform) access with GKE deployment permissions.
    -   Access to Railway/Render/Koyeb (or target backend service platform) with deployment permissions.
    -   Access to PostgreSQL (Prisma) and Upstash Redis management consoles.
    -   Access to Sentry and analytics dashboards.
-   **Tools Installed**: Git, Docker Desktop (if managing local backend services), `pnpm`, `kubectl` (if interacting with GKE directly).
-   **Environment Variables**: All required environment variables for the target environment (`.env.production`, `.env.staging`, etc.) are correctly set in the respective deployment platforms (Vercel, GKE secrets, Railway/Render/Koyeb environment configurations). This includes LLM API keys and third-party integration credentials.
-   **Database Migrations**: Ensure all necessary Prisma migrations for the target release have been prepared and reviewed.

## 4. Standard Deployment Procedure (Staging & Production)
This procedure outlines the general steps for automated deployments initiated by CI/CD pipelines (GitHub Actions).

### 4.1. Pre-Deployment Checks (Automated)
-   **Code Review**: All code merged to `main` (Staging) or a release branch (Production) must have undergone thorough code review.
-   **CI Pipeline Success**: Verify that the latest CI build for the target branch (or release tag) has passed all linting, unit tests, integration tests, and static analysis (SAST) checks.
-   **Dependency Security Scan**: Automated scan of all dependencies for known vulnerabilities.
-   **Database Migration Readiness**: Confirm that Prisma migrations are ready and validated (no conflicts, idempotent).

### 4.2. Database Schema Migration
-   **Staging**:
    -   **Action**: Automatically apply pending Prisma migrations to the Staging PostgreSQL database.
    -   **Command (conceptual)**: `pnpm prisma migrate deploy`
    -   **Verification**: Check Prisma console/logs for successful migration.
-   **Production**:
    -   **Action**: (CRITICAL) For production, migrations are typically applied as a separate, controlled step, potentially with a downtime window or blue/green deployment strategy, depending on the migration type (additive vs. destructive/breaking). Automate but monitor closely.
    -   **Command (conceptual)**: `pnpm prisma migrate deploy`
    -   **Verification**: Check database logs and monitoring for any errors.

### 4.3. Service Deployment
-   **Frontend (Next.js Application)**:
    -   **Action**: GitHub Actions triggers Vercel deployment.
    -   **Mechanism**: Vercel automatically pulls the latest `main` branch (Staging) or release tag (Production), builds, and deploys the Next.js application, including API Routes/Edge Functions.
    -   **Verification**: Monitor Vercel deployment logs for success. Check Vercel's automatic health checks.
-   **Backend Microservices (Node.js/FastAPI)**:
    -   **Action**: GitHub Actions triggers deployment to GKE or target serverless platforms.
    -   **Mechanism (GKE)**:
        -   Build Docker images.
        -   Push images to Container Registry (e.g., Google Container Registry).
        -   Update Kubernetes deployment manifest (e.g., `kubectl apply -f deployment.yaml` for rolling update).
    -   **Mechanism (Serverless Platforms like Railway/Render)**:
        -   Platform automatically pulls latest code from Git.
        -   Builds and deploys new container instances (rolling updates).
    -   **Verification**: Monitor GKE/Platform deployment logs, Kubernetes pod status (`kubectl get pods`), and service readiness probes.

### 4.4. Post-Deployment Validation (Automated)
-   **Service Health Checks**:
    -   **Action**: Automated pings to critical API endpoints (e.g., `/health`, `/status`, `/auth/login`) across all deployed services.
    -   **Verification**: Ensure all endpoints return `200 OK` or expected responses.
-   **End-to-End (E2E) Tests**:
    -   **Action**: Run Playwright E2E test suite against the newly deployed environment.
    -   **Verification**: All critical user flows (login, task creation, workflow trigger) pass.
-   **Dynamic Application Security Testing (DAST)**:
    -   **Action**: Run DAST tools against the live deployed application.
    -   **Verification**: No new critical or high-severity vulnerabilities detected.
-   **Performance Smoke Tests**:
    -   **Action**: Basic load tests to ensure core endpoints perform within acceptable latency thresholds.
    -   **Verification**: Confirms no immediate performance regressions.
-   **Monitoring & Alerting Configuration**:
    -   **Action**: Verify Sentry, Prometheus/Grafana (if applicable), and analytics tools are correctly configured for the new deployment.
    -   **Verification**: Confirm alerts are properly configured and no unexpected error spikes.

### 4.5. Rollback Procedure
In case of a critical failure during or after deployment (e.g., failed health checks, severe errors in Sentry, performance degradation):

-   **Initiate Rollback**:
    -   **Frontend (Vercel)**: Use Vercel dashboard to revert to the previous successful deployment.
    -   **Backend (GKE)**: Use `kubectl rollout undo deployment/<deployment-name>` for a quick revert to the previous version.
    -   **Backend (Serverless Platforms)**: Use platform-specific rollback features to revert to the previous build.
-   **Database Rollback**:
    -   **CRITICAL**: Database rollbacks are complex. If a migration caused the issue, revert the code and apply the inverse migration. Ensure a recent database backup is available for catastrophic failure scenarios.
-   **Isolate & Diagnose**: Once rolled back, isolate the problematic release, diagnose the root cause, and re-deploy only after a fix is thoroughly tested.

## 5. Special Deployment Considerations
-   **Zero-Downtime Deployments**: For production, implement rolling updates (Kubernetes), blue/green deployments, or canary deployments to minimize or eliminate downtime.
-   **Secrets Management**: Environment variables containing sensitive data (API keys, database credentials) are stored securely in deployment platform secrets (Vercel, GKE secrets) and never committed to Git.
-   **Image Tagging**: Docker images will be tagged with build numbers or Git commit SHAs for clear traceability.
-   **Version Control**: Adhere to the defined branching strategy (`main` for stable, feature branches for development, release branches for hotfixes/releases).
-   **Agent Warm-up**: For AI components, consider post-deployment "warm-up" routines or pre-caching to ensure optimal performance from the start.