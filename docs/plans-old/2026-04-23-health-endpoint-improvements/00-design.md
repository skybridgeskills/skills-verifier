# Health Endpoint Improvements — Design

Implements the observability-baseline M2 health check pattern from the monorepo, adapted for the skills-verifier codebase.

## Scope of Work

1. **Core health check abstractions** — `HealthCheckSym`, `HealthCheck` factory, `HealthStatus`, `HealthRegistry`
2. **Per-dependency check factories** — DynamoDB, HTTP (for CE API)
3. **Readiness response builder** — OTel-shaped envelope
4. **`/health/ready` endpoint** — SvelteKit route handler
5. **Service wiring** — Add `[HealthCheckSym]` to services with external deps
6. **App context wiring** — `provideHealthRegistry` appended to provider chains

**Out of scope:**

- Changes to `/health` (liveness) — stays as-is for ALB compatibility
- Terraform/ALB changes
- Synthetic probes

## File Structure

```
src/
├── lib/server/
│   ├── health/                              # NEW: core health module
│   │   ├── health-check.ts                  # HealthCheckSym, HealthStatus, HealthCheck factory
│   │   ├── health-check.test.ts
│   │   ├── health-registry.ts               # Registry with timeout/cache/single-flight
│   │   ├── health-registry.test.ts
│   │   ├── provide-health-registry.ts         # Provider that discovers checks from context
│   │   ├── provide-health-registry.test.ts
│   │   ├── readiness-response.ts            # ReadinessResponse type
│   │   ├── build-readiness-response.ts        # OTel envelope builder
│   │   ├── build-readiness-response.test.ts
│   │   └── checks/                          # NEW: per-dep check factories
│   │       ├── dynamodb-health-check.ts
│   │       ├── dynamodb-health-check.test.ts
│   │       ├── http-health-check.ts
│   │       └── http-health-check.test.ts
│   │
│   ├── core/storage/storage-database-ctx.ts   # UPDATE: add [HealthCheckSym]
│   │
│   ├── services/skill-search/credential-engine/
│   │   └── credential-engine-skill-search-service.ts  # UPDATE: add [HealthCheckSym]
│   │
│   ├── aws-app-context.ts                   # UPDATE: append provideHealthRegistry
│   ├── dev-app-context.ts                   # UPDATE: append provideHealthRegistry
│   └── test-app-context.ts                  # UPDATE: append provideHealthRegistry
│
└── routes/
    └── health/
        └── ready/                           # NEW: readiness endpoint
            └── +server.ts                   # Re-export handleReadinessGet as GET
```

## Conceptual Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│ App boot — provider chain                                            │
│                                                                      │
│   RealLoggerServiceCtx                                               │
│   RealTimeServiceCtx                                                 │
│   RealIdServiceCtx                                                   │
│   provideHttpFrameworkClient                                         │
│   StorageDatabaseCtx         ─┐ each returns a service that MAY     │
│   provideCredentialEngine... ─┤ carry a [HealthCheckSym] property    │
│                               │                                      │
│                               ▼                                      │
│   provideHealthRegistry  ──► walks top-level ctx values, pulls out   │
│                              [HealthCheckSym] entries, constructs      │
│                              HealthRegistry, adds to context           │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
                 ▼
       ┌──────────────────────────────────────────────┐
       │ HealthRegistry                               │
       │   runAll() ──► returns aggregated result     │
       │     - per-check timeout (default 2s)         │
       │     - process-global cache, ~5s TTL          │
       │     - single-flight                          │
       │     - aggregate: any DOWN→DOWN, any DEGR→    │
       │       DEGRADED, else UP                      │
       └──────────────────────────────────────────────┘


Service-side (one line per service with external deps):

  return {
    search, searchContainers, searchFrameworks,
    [HealthCheckSym]: HttpHealthCheck({ name: 'credential-engine', ... }),
  };


Endpoint-side:

  src/routes/health/ready/+server.ts
    └── handleReadinessGet()
          └── buildReadinessResponse()
                ├── healthRegistry().runAll()
                ├── bootstrapInfo() ──► service.name, service.version
                └── nowDate() ──► timestamp
```

## Main Components

### `HealthCheckSym` + `HealthCheck`

Local `unique symbol` (not `Symbol.for(...)`). Services with external deps expose a `HealthCheck` under this symbol.

```typescript
export const HealthCheckSym: unique symbol = Symbol('healthCheck');

export type HealthStatus = 'UP' | 'DEGRADED' | 'DOWN';

export interface HealthCheckResult {
	status: HealthStatus;
	error?: string;
	details?: Record<string, unknown>;
}

export interface HealthCheck {
	name: string;
	check: () => Promise<HealthCheckResult>;
	timeoutMs?: number;
}

export function HealthCheck(opts: HealthCheck): HealthCheck {
	return opts;
}
```

### `HealthRegistry`

- **Per-check timeout** — Races each check against timeout; timed-out → `DOWN`
- **Cache** — Returns cached result if `now - lastRunAt < cacheTtlMs`
- **Single-flight** — Concurrent `runAll()` calls share one in-flight promise
- **Aggregate rule** — Any `DOWN`→`DOWN`; any `DEGRADED`→`DEGRADED`; else `UP`

```typescript
export interface HealthRegistry {
	register(check: HealthCheck): void;
	size(): number;
	runAll(): Promise<RegistryRunResult>;
}

export interface RegistryRunResult {
	overall: HealthStatus;
	components: Record<string, ComponentResult>;
	runAtMs: number;
}
```

### `provideHealthRegistry`

Late-running provider that walks top-level context values for `[HealthCheckSym]` properties.

```typescript
export function provideHealthRegistry(ctx: object): { healthRegistry: HealthRegistry } {
	const registry = HealthRegistry();
	for (const value of Object.values(ctx)) {
		const check = (value as any)?.[HealthCheckSym];
		if (check != null) registry.register(check);
	}
	return { healthRegistry: registry };
}
```

### Per-dependency Check Factories

**`DynamoDBHealthCheck`** — `DescribeTable` or `GetItem` with small payload

**`HttpHealthCheck`** — `GET <baseUrl>/health` or similar; 2xx = UP, 5xx = DOWN, other = DEGRADED

Used by:

- `credential-engine-skill-search-service` → `HttpHealthCheck({ name: 'credential-engine', ... })`

### Readiness Response

OTel-shaped envelope matching the monorepo:

```typescript
interface ReadinessResponse {
	status: HealthStatus;
	'service.name': string;
	'service.version': string;
	'deployment.environment': string;
	startupTime: string;
	timestamp: string;
	components: Record<
		string,
		{
			status: HealthStatus;
			durationMs: number;
			error?: string;
			details?: Record<string, unknown>;
		}
	>;
}
```

HTTP status: 200 on `UP`/`DEGRADED`, 503 on `DOWN`.

### SvelteKit Handler

```typescript
// src/routes/health/ready/+server.ts
import { handleReadinessGet } from '$lib/server/health/handle-readiness-get.js';
export const GET = handleReadinessGet;
```

## Service Wiring

### `credential-engine-skill-search-service.ts`

```typescript
import { HealthCheck, HealthCheckSym } from '../health/health-check.js';
import { HttpHealthCheck } from '../health/checks/http-health-check.js';

export function CredentialEngineSkillSearchService(config: CredentialEngineSkillSearchConfig) {
	// ... existing implementation ...

	return {
		search,
		searchContainers,
		searchFrameworks,
		[HealthCheckSym]: HttpHealthCheck({
			name: 'credential-engine',
			baseUrl: config.searchUrl.replace(/\/assistant\/search.*$/, ''), // Extract base URL
			path: '/health'
		})
	};
}
```

### `storage-database-ctx.ts`

The DynamoDB client is created via AWS SDK. Add a check:

```typescript
import { HealthCheck, HealthCheckSym } from '../health/health-check.js';
import { DynamoDBHealthCheck } from '../health/checks/dynamodb-health-check.js';

// In the provider:
return {
	// ... existing database methods ...
	[HealthCheckSym]: DynamoDBHealthCheck({ client, tableName })
};
```

## App Context Wiring

Append `provideHealthRegistry` to each provider chain:

```typescript
// aws-app-context.ts
return (await Providers(
  RealLoggerServiceCtx({ level: 'info', pretty: false }),
  RealTimeServiceCtx,
  RealIdServiceCtx,
  provideHttpFrameworkClient,
  StorageDatabaseCtx(env),
  () => provideCredentialEngineSkillSearchService({...}),
  provideHealthRegistry,  // ← NEW: last in chain
)()) as AppContext;
```

Same for `dev-app-context.ts` and `test-app-context.ts`.

## Testing Strategy

1. **Unit tests** for each new module (next to implementation)
2. **Integration test** for `/health/ready` endpoint
3. **Manual verification**:
   - Working CE API → UP status
   - Broken CE API (simulated) → DOWN or DEGRADED status
