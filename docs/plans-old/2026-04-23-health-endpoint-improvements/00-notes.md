# Health Endpoint Improvements — Notes

## Scope of Work

Apply health endpoint improvements from the observability-baseline roadmap in the monorepo (`/Users/yona/dev/skybridge/skybridgeskills-monorepo/docs/roadmaps/2026-04-20-observability-baseline/m2-health-checks`) to the skills-verifier repository.

The CE API on staging is currently broken (HTTP 400 errors), and this should be reflected in our health checks. The goal is to add a readiness probe endpoint (`/health/ready`) that aggregates real dependency checks, while keeping the existing `/health` (liveness) endpoint cheap and unchanged for ALB target health checks.

## Current State

### Existing Health Endpoints

1. **`/health` (liveness)** — `src/routes/health/+server.ts`
   - Returns `{ ok: true }` with HTTP 200
   - Used by ALB target health checks
   - No external I/O — intentionally cheap

2. **`/version`** — `src/routes/version/+server.ts`
   - Returns version manifest with build info
   - Already implemented per Phase 3 of the skills-verifier-staging plan

### App Context Structure

The app uses a provider-based dependency injection system:

- `src/lib/server/app-context.ts` — Defines `AppContext` interface with services:
  - `logger: LoggerService`
  - `timeService: TimeService`
  - `idService: IdService`
  - `frameworkClient: FrameworkClient`
  - `database: StorageDatabase`
  - `skillSearchService: SkillSearchService`

- `src/lib/server/build-app-context.ts` — Dispatches to context-specific builders
- `src/lib/server/aws-app-context.ts` — AWS/production context with real services
- `src/lib/server/dev-app-context.ts` — Dev context with fake/stub services
- `src/lib/server/test-app-context.ts` — Test context

### Dependencies to Check

Based on the AWS app context (`aws-app-context.ts`), the production app depends on:

1. **Credential Engine API** — External HTTP API for skill search
   - `CREDENTIAL_ENGINE_SEARCH_URL` + `CREDENTIAL_ENGINE_API_KEY`
   - This is the service currently failing (HTTP 400)

2. **DynamoDB** — Database for job storage
   - `DYNAMODB_TABLE`
   - Via `StorageDatabaseCtx`

3. **Framework Client** — HTTP client for framework lookups
   - Via `provideHttpFrameworkClient`

### Provider System

The app uses a custom provider pattern (`src/lib/server/util/provider/providers.ts`):

- Services are composed via `Providers(...)` chain
- Context is accessed via `providerCtx<T>()` and `providerCtxSafe<T>()`
- AsyncLocalStorage-based context propagation via `runInContext()`

## Key Differences from Monorepo

The monorepo's `lib-backend` package has:

- `HealthCheckSym` — Symbol for exposing health checks on services
- `HealthRegistry` — Registry that runs checks with timeout, caching, single-flight
- `provideHealthRegistry` — Provider that discovers checks from context
- Per-dependency check factories (postgres, redis, http-dep, s3, kms)

The skills-verifier repo:

- Does NOT have `lib-backend` — it's a standalone SvelteKit app
- Has its own provider system in `src/lib/server/util/provider/`
- Uses different service abstractions

## Questions

### Q1: Which dependencies should have health checks?

**Context:** The monorepo has postgres, redis, http-dep, s3, kms checks. Skills-verifier has DynamoDB, Credential Engine API, and Framework Client.

**Suggested answer:**

- **Credential Engine API** — MUST have a health check (this is the one currently failing)
- **DynamoDB** — Should have a health check (database connectivity)
- **Framework Client** — Could have a health check, but lower priority (used less frequently)

### Q2: How to adapt the symbol-keyed health check pattern?

**Context:** The monorepo uses `HealthCheckSym` on service objects. Skills-verifier's services are plain objects with methods, not classes.

**Suggested answer:** Add the symbol to service objects that have external dependencies:

```typescript
export const HealthCheckSym: unique symbol = Symbol('healthCheck');

// In CredentialEngineSkillSearchService:
return {
  search, searchContainers, searchFrameworks,
  [HealthCheckSym]: HttpHealthCheck({ name: 'credential-engine', ... })
};
```

### Q3: Where should health check modules live?

**Context:** Monorepo has `sbs/packages/lib-backend/src/core/health/`. Skills-verifier is a single app.

**Suggested answer:** Create `src/lib/server/health/` with:

- `health-check.ts` — Core types and `HealthCheckSym`
- `health-registry.ts` — Registry implementation
- `checks/` — Per-dependency check factories
- `build-readiness-response.ts` — Response builder

### Q4: Should the liveness (`/health`) endpoint be enhanced?

**Context:** Monorepo M1 enhanced liveness with OTel-shaped payload. Skills-verifier's current `/health` just returns `{ ok: true }`.

**Suggested answer:**

- Keep `/health` simple for ALB compatibility (no external I/O)
- Could optionally add `service.name`, `service.version`, `timestamp` from existing `buildVersionBody()` but keep it minimal
- The main value is in the new `/health/ready` endpoint

## Decisions Recorded

| Decision                    | Status     | Notes                                                            |
| --------------------------- | ---------- | ---------------------------------------------------------------- |
| Which dependencies to check | Pending Q1 | CE API required; DynamoDB recommended; Framework Client optional |
| Symbol-keyed pattern        | Pending Q2 | Adapt the monorepo pattern to skills-verifier's provider system  |
| Module location             | Pending Q3 | `src/lib/server/health/`                                         |
| Liveness enhancement        | Pending Q4 | Keep simple, focus on readiness                                  |

## Test Strategy

- Unit tests for `HealthRegistry` (timeout, caching, single-flight, aggregation)
- Unit tests for each check factory (happy path, error path, timeout)
- Integration test for `/health/ready` endpoint
- Manual verification: `curl /health/ready` with working and broken CE API

## Validation Commands

```bash
pnpm check
pnpm test:vitest
# Manual:
curl http://localhost:5173/health/ready
```
