# Health Endpoint Improvements — Summary

### What was built

- Added `src/lib/server/health/` module: `HealthCheckSym`, `HealthRegistry` (timeout, cache, single-flight), `provideHealthRegistry`, readiness types, `buildReadinessResponse`, `handleReadinessGet`.
- Added `checks/dynamodb-health-check.ts` (DescribeTable) and `checks/http-health-check.ts` (GET with optional Bearer), with unit tests.
- Wired `[HealthCheckSym]` on DynamoDB storage context (aws only) and Credential Engine skill search service.
- Appended `provideHealthRegistry` to aws, dev, and test provider chains; extended `AppContext` with `healthRegistry`.
- Added `GET /health/ready` route; left `GET /health` unchanged.
- Updated manual test contexts in `app-context.test.ts` to include a registry.

### Decisions for future reference

#### CE probe is HTTP GET on origin `/health`

- **Decision:** Use `HttpHealthCheck` against `{origin}/health` with the same API key as search.
- **Why:** Aligns with monorepo `http-dep` pattern; keeps checks cheap.
- **Rejected alternatives:** Minimal POST to assistant search (heavier; duplicates script logic).
- **Revisit when:** If Credential Engine drops or moves the health URL, or GET does not reflect API-key validity (then add a minimal search POST check).

#### `deployment.environment` maps to `CONTEXT`

- **Decision:** `parseBaseEnv` / `aws` | `dev` | `test` from `CONTEXT`.
- **Why:** Matches existing deployment env model in this repo.

#### Registry wall clock

- **Decision:** `HealthRegistry` uses `Date.now()` internally (not `TimeService`).
- **Why:** Avoids coupling the registry to request context; matches “process level” probe behavior.
- **Revisit when:** If tests need injectable time without fake timers on `Date`.

No notable decisions beyond the above.
