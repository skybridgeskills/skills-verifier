# Phase 7 — Cleanup and validation

## Scope of phase

Final cleanup, validation, and summary documentation.

**In scope:**

1. Grep for temporary code, TODOs, debug prints, etc. — remove them
2. Fix any remaining warnings, errors, or formatting issues
3. Run full test suite
4. Create summary document

**Out of scope:**

- New feature work
- Changes outside this plan's scope

## Cleanup checklist

Search for and remove:

- [ ] `TODO:` or `FIXME:` comments (unless genuinely deferred)
- [ ] `console.log` or debug prints
- [ ] `// eslint-disable` added temporarily
- [ ] `it.skip` or `describe.skip` in tests
- [ ] Unused imports

Commands to run:

```bash
# Search for TODOs
grep -r "TODO\|FIXME" src/lib/server/health/ || echo "No TODOs found"

# Search for console.log
grep -r "console.log\|console.debug" src/lib/server/health/ || echo "No console.log found"

# Search for eslint-disable
grep -r "eslint-disable" src/lib/server/health/ || echo "No eslint-disable found"
```

## Validation

### Full test suite

```bash
pnpm check
pnpm test:vitest
```

### Manual verification

1. **Dev context** (no real dependencies):

   ```bash
   pnpm dev &
   sleep 5
   curl -s http://localhost:5173/health/ready | jq .
   ```

   Expected: `status: "UP"`, `components: {}`

2. **Test the liveness endpoint still works**:

   ```bash
   curl -s http://localhost:5173/health | jq .
   ```

   Expected: `{ "ok": true }` (unchanged)

3. **Verify version endpoint still works**:
   ```bash
   curl -s http://localhost:5173/version | jq .
   ```
   Expected: version info with `version`, `extra` fields

## Summary document

Create `docs/plans/2026-04-23-health-endpoint-improvements/summary.md`:

````markdown
# Health Endpoint Improvements — Summary

## What was built

### Core health module (`src/lib/server/health/`)

- `health-check.ts` — `HealthCheckSym`, `HealthStatus`, `HealthCheck` factory
- `health-registry.ts` — `HealthRegistry` with timeout, cache, single-flight
- `provide-health-registry.ts` — Provider that discovers checks from context
- `readiness-response.ts` — `ReadinessResponse` type (OTel-shaped)
- `build-readiness-response.ts` — Response builder with HTTP status decision
- `handle-readiness-get.ts` — SvelteKit handler for `/health/ready`

### Per-dependency check factories (`src/lib/server/health/checks/`)

- `dynamodb-health-check.ts` — Probes DynamoDB via `DescribeTable`
- `http-health-check.ts` — Probes HTTP services (used for CE API)

### Service wiring

- `credential-engine-skill-search-service.ts` — Added `[HealthCheckSym]: HttpHealthCheck(...)`
- `storage-database-ctx.ts` — Added `[HealthCheckSym]: DynamoDBHealthCheck(...)`

### App wiring

- `aws-app-context.ts` — Appended `provideHealthRegistry`
- `dev-app-context.ts` — Appended `provideHealthRegistry`
- `test-app-context.ts` — Appended `provideHealthRegistry`

### New endpoint

- `src/routes/health/ready/+server.ts` — `GET /health/ready` returns readiness status

## Decisions for future reference

#### Symbol-keyed health check pattern

- **Decision:** Services with external deps expose `HealthCheck` under `[HealthCheckSym]`
- **Why:** Matches monorepo pattern; allows `provideHealthRegistry` to discover checks automatically
- **Alternative considered:** Manual registration in each app context — rejected because it duplicates the dependency list
- **Revisit when:** If we add many more services with complex dependency graphs

#### HTTP health check behavior

- **Decision:** 2xx = UP, 5xx = DOWN, other (3xx, 4xx) = DEGRADED
- **Why:** 4xx from health endpoint usually means endpoint doesn't exist (service up, health not configured)
- **Alternative considered:** All non-2xx as DOWN — rejected because 404 would mask actual service availability

#### DynamoDB health check: DescribeTable vs GetItem

- **Decision:** Use `DescribeTable` command
- **Why:** Lightweight, verifies both connectivity and table existence
- **Alternative considered:** `GetItem` with dummy key — rejected because it generates 404s in logs

#### Registry cache TTL: 5 seconds

- **Decision:** 5 second cache for `runAll()` results
- **Why:** Bounds load on dependencies under concurrent probes; fast enough for alerting
- **Revisit when:** If we add synthetic probes that need sub-second freshness

## API reference

### `GET /health/ready`

Returns the readiness status of the application and its dependencies.

**Response format:**

```json
{
	"status": "UP | DEGRADED | DOWN",
	"service.name": "skills-verifier",
	"service.version": "1.2.3",
	"deployment.environment": "aws",
	"startupTime": "2026-04-23T10:00:00.000Z",
	"timestamp": "2026-04-23T10:05:00.000Z",
	"components": {
		"credential-engine": {
			"status": "UP",
			"durationMs": 45
		},
		"dynamodb": {
			"status": "UP",
			"durationMs": 12
		}
	}
}
```
````

**HTTP status codes:**

- `200` — Overall status is UP or DEGRADED
- `503` — Overall status is DOWN

**Error example (CE API broken):**

```json
{
	"status": "DOWN",
	"service.name": "skills-verifier",
	"service.version": "1.2.3",
	"deployment.environment": "aws",
	"startupTime": "2026-04-23T10:00:00.000Z",
	"timestamp": "2026-04-23T10:05:00.000Z",
	"components": {
		"credential-engine": {
			"status": "DOWN",
			"durationMs": 50,
			"error": "HTTP 400 Error validating API key"
		},
		"dynamodb": {
			"status": "UP",
			"durationMs": 10
		}
	}
}
```

```

## Definition of done

- [ ] No TODOs, console.logs, or temporary eslint-disable
- [ ] `pnpm check` passes
- [ ] `pnpm test:vitest` passes
- [ ] Manual verification of `/health/ready` endpoint works
- [ ] Manual verification of existing `/health` endpoint still works
- [ ] `summary.md` created with decisions documented
```
