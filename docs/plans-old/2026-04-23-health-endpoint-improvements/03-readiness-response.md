# Phase 3 — Readiness response builder

## Scope of phase

The OTel-shaped JSON envelope plus the HTTP-status decision.

- `readiness-response.ts` — `ReadinessResponse` interface + `ReadinessHttpResult` shape
- `build-readiness-response.ts` — `buildReadinessResponse()` that reads bootstrap info + time service + health registry
- Tests for `build-readiness-response.ts`

**In scope:** the three files (2 modules + 1 test).

**Out of scope:**

- Framework adapters / route handlers (Phase 5)
- The registry + checks (Phases 1 & 2)
- App wiring (Phase 6)

This phase depends on Phase 1 (`HealthRegistry`, `healthRegistry()`, `provideHealthRegistry`).

It can run in parallel with Phase 2 (touches disjoint files).

## Code organization reminders

- Keep `readiness-response.ts` types-only (no runtime)
- `build-readiness-response.ts` is a single function plus tiny helper at bottom
- No `// TODO:`

## Sub-agent reminders

- **Do not commit.**
- **Do not expand scope.** No framework adapters, no app changes.
- **Do not skip or weaken tests.**
- Inject context via `runInContext(...)` in tests — do not depend on Phase 6 wiring.

## Implementation details

### Reference: Liveness response shape (existing)

The version endpoint already provides build info via `buildVersionBody()`. For readiness, we need similar OTel-shaped fields plus the components map.

### File: `src/lib/server/health/readiness-response.ts`

```typescript
import type { HealthStatus } from './health-check.js';

/**
 * Per-component shape inside the readiness response.
 */
export interface ReadinessComponent {
	status: HealthStatus;
	durationMs: number;
	error?: string;
	details?: Record<string, unknown>;
}

/**
 * Readiness probe response payload (`GET /health/ready`).
 *
 * Top-level OTel-named fields. The `components` map carries one entry
 * per registered `HealthCheck`.
 */
export interface ReadinessResponse {
	status: HealthStatus;
	'service.name': string;
	'service.version': string;
	'deployment.environment': string;
	startupTime: string;
	timestamp: string;
	components: Record<string, ReadinessComponent>;
}

/**
 * What `buildReadinessResponse()` returns: both the body and the
 * HTTP status code adapters should send.
 */
export interface ReadinessHttpResult {
	body: ReadinessResponse;
	httpStatus: 200 | 503;
}
```

### File: `src/lib/server/health/build-readiness-response.ts`

```typescript
import { nowDate } from '../services/time-service/time-service.js';
import { buildVersionBody } from '../util/build-version-body.js';

import type { HealthStatus } from './health-check.js';
import { healthRegistrySafe } from './provide-health-registry.js';
import type { ReadinessHttpResult, ReadinessResponse } from './readiness-response.js';

/**
 * Builds the readiness response payload + HTTP status for the
 * `/health/ready` probe.
 *
 * Returns 503 on overall DOWN, 200 otherwise.
 */
export async function buildReadinessResponse(): Promise<ReadinessHttpResult> {
	const version = buildVersionBody();
	const registry = healthRegistrySafe();

	// If no registry is present (e.g., during early boot or misconfiguration),
	// report as DOWN with a clear error
	if (!registry) {
		const body: ReadinessResponse = {
			status: 'DOWN',
			'service.name': version.version,
			'service.version': version.version,
			'deployment.environment': process.env.CONTEXT ?? 'unknown',
			startupTime: new Date().toISOString(),
			timestamp: nowDate().toISOString(),
			components: {
				registry: {
					status: 'DOWN',
					durationMs: 0,
					error: 'Health registry not initialized'
				}
			}
		};
		return { body, httpStatus: 503 };
	}

	const run = await registry.runAll();

	const components = Object.fromEntries(
		Object.entries(run.components).map(([name, c]) => [
			name,
			{
				status: c.status,
				durationMs: c.durationMs,
				...(c.error !== undefined ? { error: c.error } : {}),
				...(c.details !== undefined ? { details: c.details } : {})
			}
		])
	);

	const body: ReadinessResponse = {
		status: run.overall,
		'service.name': 'skills-verifier',
		'service.version': version.version,
		'deployment.environment': process.env.CONTEXT ?? 'unknown',
		startupTime: new Date().toISOString(),
		timestamp: nowDate().toISOString(),
		components
	};

	return { body, httpStatus: httpStatusFor(run.overall) };
}

// ---------------------------------------------------------------------------
// helpers

function httpStatusFor(overall: HealthStatus): 200 | 503 {
	return overall === 'DOWN' ? 503 : 200;
}
```

### File: `src/lib/server/health/build-readiness-response.test.ts`

Inject context via `runInContext(...)` with minimal stub registry.

```typescript
import { runInContext } from '../util/provider/provider-ctx.js';
import { describe, expect, it, vi } from 'vitest';

import { buildReadinessResponse } from './build-readiness-response.js';
import type { HealthRegistry, RegistryRunResult } from './health-registry.js';

function fakeRegistry(result: RegistryRunResult): HealthRegistry {
	return {
		register: () => {},
		size: () => Object.keys(result.components).length,
		runAll: async () => result
	};
}

const startupTime = new Date('2026-04-22T10:00:00.000Z');
const fixedNow = new Date('2026-04-22T10:05:00.000Z');

const baseCtx = (registry: HealthRegistry) => ({
	healthRegistry: registry,
	// Mock time service
	timeService: {
		nowMs: () => fixedNow.getTime(),
		nowDate: () => fixedNow
	}
});

describe('buildReadinessResponse', () => {
	it('returns the OTel envelope + components map for an all-UP system, status 200', async () => {
		const reg = fakeRegistry({
			overall: 'UP',
			runAtMs: fixedNow.getTime(),
			components: {
				dynamodb: { status: 'UP', durationMs: 4 },
				'credential-engine': { status: 'UP', durationMs: 2 }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());

		expect(r.httpStatus).toBe(200);
		expect(r.body.status).toBe('UP');
		expect(r.body['service.name']).toBe('skills-verifier');
		expect(r.body['deployment.environment']).toBeDefined();
		expect(r.body.timestamp).toBeDefined();
		expect(r.body.startupTime).toBeDefined();
		expect(r.body.components).toEqual({
			dynamodb: { status: 'UP', durationMs: 4 },
			'credential-engine': { status: 'UP', durationMs: 2 }
		});
	});

	it('keeps httpStatus 200 on overall DEGRADED', async () => {
		const reg = fakeRegistry({
			overall: 'DEGRADED',
			runAtMs: fixedNow.getTime(),
			components: {
				'credential-engine': { status: 'DEGRADED', durationMs: 10, error: 'HTTP 404' }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(r.body.status).toBe('DEGRADED');
		expect(r.httpStatus).toBe(200);
		expect(r.body.components['credential-engine'].error).toBe('HTTP 404');
	});

	it('returns httpStatus 503 on overall DOWN', async () => {
		const reg = fakeRegistry({
			overall: 'DOWN',
			runAtMs: fixedNow.getTime(),
			components: {
				dynamodb: { status: 'DOWN', durationMs: 7, error: 'connection refused' }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(r.httpStatus).toBe(503);
		expect(r.body.status).toBe('DOWN');
	});

	it('omits error/details fields when the check did not provide them', async () => {
		const reg = fakeRegistry({
			overall: 'UP',
			runAtMs: fixedNow.getTime(),
			components: {
				dynamodb: { status: 'UP', durationMs: 4 }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(Object.keys(r.body.components.dynamodb).sort()).toEqual(['durationMs', 'status']);
	});

	it('passes through details when the check provides them', async () => {
		const reg = fakeRegistry({
			overall: 'UP',
			runAtMs: fixedNow.getTime(),
			components: {
				dynamodb: { status: 'UP', durationMs: 12, details: { tableName: 'jobs' } }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(r.body.components.dynamodb.details).toEqual({ tableName: 'jobs' });
	});

	it('returns UP with empty components when no checks are registered', async () => {
		const reg = fakeRegistry({
			overall: 'UP',
			runAtMs: fixedNow.getTime(),
			components: {}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(r.httpStatus).toBe(200);
		expect(r.body.components).toEqual({});
	});

	it('returns DOWN with error when registry is not in context', async () => {
		const r = await runInContext({}, () => buildReadinessResponse());
		expect(r.httpStatus).toBe(503);
		expect(r.body.status).toBe('DOWN');
		expect(r.body.components.registry.error).toBe('Health registry not initialized');
	});
});
```

## Validate

```bash
pnpm check
pnpm test:vitest src/lib/server/health/build-readiness-response.test.ts
```

## Definition of done

- 3 new files under `src/lib/server/health/` (2 modules + 1 test).
- No edits outside `src/lib/server/health/`.
- No new `// eslint-disable`, no `it.skip`, no `// TODO:`.
- `pnpm check` and tests pass.
