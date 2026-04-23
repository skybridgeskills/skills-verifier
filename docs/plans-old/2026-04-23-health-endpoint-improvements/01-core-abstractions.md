# Phase 1 — Core abstractions: HealthCheck + HealthRegistry + provideHealthRegistry

## Scope of phase

Establish the three foundational primitives:

1. `HealthCheckSym`, `HealthCheck` factory, `HealthStatus`, `HealthCheckResult` — the contract every service-side check follows
2. `HealthRegistry` — the runtime that runs checks with per-check timeout, caches aggregated result, single-flights concurrent `runAll()` calls
3. `provideHealthRegistry` — the late-running provider that walks assembled context for `[HealthCheckSym]` properties

**In scope:** all three modules + their unit tests.

**Out of scope:**

- Per-dep check factories (Phase 2)
- Readiness response builder (Phase 3)
- Touching any service file or app file
- Changing app context files (Phase 6)

## Code organization reminders

- One concept per file. Three modules → three files (plus tests).
- Tests next to implementation (`*.test.ts`).
- Keep helper functions at the bottom of each file; types and exported factory at the top.
- No `// TODO:` comments unless genuinely deferred.

## Sub-agent reminders

- **Do not commit.** The plan commits as one unit at the end.
- **Do not expand scope.** Stay strictly within "In scope" above.
- **Do not suppress warnings**, no `// eslint-disable` to silence problems away — fix the actual cause.
- **Do not disable, skip, or weaken existing tests.**
- If something blocks completion, stop and report rather than improvising.

## Implementation details

### File: `src/lib/server/health/health-check.ts`

```typescript
/**
 * Symbol-keyed property under which a service factory exposes its
 * `HealthCheck`. The `provideHealthRegistry` discovery step walks
 * top-level context values and pulls these out.
 *
 * Modeled on `[Symbol.asyncDispose]`. Local `unique symbol` (not
 * `Symbol.for(...)`) so the type narrows tightly and there's no risk
 * of cross-realm collision.
 */
export const HealthCheckSym: unique symbol = Symbol('healthCheck');

export type HealthStatus = 'UP' | 'DEGRADED' | 'DOWN';

export interface HealthCheckResult {
	status: HealthStatus;
	/** Populated on DEGRADED / DOWN. */
	error?: string;
	/** Optional check-specific extra info; surfaces in the readiness payload. */
	details?: Record<string, unknown>;
}

export interface HealthCheck {
	/** Unique key in the readiness `components` map, e.g. `'dynamodb'`. */
	name: string;
	/**
	 * The actual probe. Should be cheap and idempotent. The registry
	 * adds an external timeout — the check does not need to enforce
	 * one itself, but should still avoid pathological hangs.
	 */
	check: () => Promise<HealthCheckResult>;
	/** Per-check override for the registry's default timeout. */
	timeoutMs?: number;
}

/**
 * Factory for a `HealthCheck`. Currently a thin pass-through; exists
 * so service files have a single import that bundles type + symbol +
 * factory, and so we can extend the contract later without renaming.
 */
export function HealthCheck(opts: HealthCheck): HealthCheck {
	return opts;
}
```

### File: `src/lib/server/health/health-check.test.ts`

```typescript
import { describe, expect, it } from 'vitest';

import { HealthCheck, HealthCheckSym } from './health-check.js';

describe('HealthCheckSym', () => {
	it('is a unique symbol with a descriptive label', () => {
		expect(typeof HealthCheckSym).toBe('symbol');
		expect(HealthCheckSym.toString()).toContain('healthCheck');
	});
});

describe('HealthCheck factory', () => {
	it('passes through name + check + optional timeoutMs', () => {
		const check = async () => ({ status: 'UP' as const });
		const h = HealthCheck({ name: 'dynamodb', check, timeoutMs: 1500 });
		expect(h.name).toBe('dynamodb');
		expect(h.check).toBe(check);
		expect(h.timeoutMs).toBe(1500);
	});

	it('preserves a missing timeoutMs as undefined (registry will default)', () => {
		const h = HealthCheck({ name: 'ce', check: async () => ({ status: 'UP' }) });
		expect(h.timeoutMs).toBeUndefined();
	});
});
```

### File: `src/lib/server/health/health-registry.ts`

Use `nowMs()` from `src/lib/server/services/time-service/time-service.ts` for time measurement.

```typescript
import { nowMs } from '../services/time-service/time-service.js';

import type { HealthCheck, HealthCheckResult, HealthStatus } from './health-check.js';

export interface HealthRegistryOpts {
	/** Default per-check timeout. Defaults to 2000ms. */
	defaultTimeoutMs?: number;
	/** How long an aggregated `runAll()` result is reused. Defaults to 5000ms. */
	cacheTtlMs?: number;
}

export interface ComponentResult {
	status: HealthStatus;
	durationMs: number;
	error?: string;
	details?: Record<string, unknown>;
}

export interface RegistryRunResult {
	overall: HealthStatus;
	components: Record<string, ComponentResult>;
	/** Unix-ms timestamp of when this run started. */
	runAtMs: number;
}

export interface HealthRegistry {
	register(check: HealthCheck): void;
	/** Number of registered checks (handy for tests + readiness payload). */
	size(): number;
	/**
	 * Runs every registered check (or returns the cached result if a
	 * recent run is still warm). Concurrent callers share the same
	 * in-flight promise.
	 */
	runAll(): Promise<RegistryRunResult>;
}

export function HealthRegistry(opts: HealthRegistryOpts = {}): HealthRegistry {
	const defaultTimeoutMs = opts.defaultTimeoutMs ?? 2000;
	const cacheTtlMs = opts.cacheTtlMs ?? 5000;

	const checks: HealthCheck[] = [];
	let cached: RegistryRunResult | undefined;
	let inFlight: Promise<RegistryRunResult> | undefined;

	function register(check: HealthCheck) {
		checks.push(check);
	}

	function size() {
		return checks.length;
	}

	async function runAll(): Promise<RegistryRunResult> {
		const now = nowMs();
		if (cached && now - cached.runAtMs < cacheTtlMs) {
			return cached;
		}
		if (inFlight) {
			return inFlight;
		}

		inFlight = (async () => {
			const startedAt = nowMs();
			const componentEntries = await Promise.all(
				checks.map(async (check): Promise<[string, ComponentResult]> => {
					const result = await runOneCheck(check, defaultTimeoutMs);
					return [check.name, result];
				})
			);

			const components: Record<string, ComponentResult> = Object.fromEntries(componentEntries);
			const overall = aggregateStatus(componentEntries.map(([, r]) => r.status));

			const result: RegistryRunResult = {
				overall,
				components,
				runAtMs: startedAt
			};
			cached = result;
			return result;
		})();

		try {
			return await inFlight;
		} finally {
			inFlight = undefined;
		}
	}

	return { register, size, runAll };
}

// ---------------------------------------------------------------------------
// helpers (bottom of file)

async function runOneCheck(check: HealthCheck, defaultTimeoutMs: number): Promise<ComponentResult> {
	const timeoutMs = check.timeoutMs ?? defaultTimeoutMs;
	const startedAt = nowMs();

	let timer: NodeJS.Timeout | undefined;
	const timeoutPromise = new Promise<HealthCheckResult>((resolve) => {
		timer = setTimeout(() => resolve({ status: 'DOWN', error: 'timeout' }), timeoutMs);
	});

	let raw: HealthCheckResult;
	try {
		raw = await Promise.race([check.check(), timeoutPromise]);
	} catch (err) {
		raw = { status: 'DOWN', error: err instanceof Error ? err.message : String(err) };
	} finally {
		if (timer) clearTimeout(timer);
	}

	return {
		status: raw.status,
		durationMs: nowMs() - startedAt,
		...(raw.error !== undefined ? { error: raw.error } : {}),
		...(raw.details !== undefined ? { details: raw.details } : {})
	};
}

function aggregateStatus(statuses: HealthStatus[]): HealthStatus {
	if (statuses.some((s) => s === 'DOWN')) return 'DOWN';
	if (statuses.some((s) => s === 'DEGRADED')) return 'DEGRADED';
	return 'UP';
}
```

### File: `src/lib/server/health/health-registry.test.ts`

```typescript
import { describe, expect, it, vi } from 'vitest';

import { HealthCheck } from './health-check.js';
import { HealthRegistry } from './health-registry.js';

describe('HealthRegistry', () => {
	it('runs all registered checks and aggregates UP when everything is UP', async () => {
		const reg = HealthRegistry();
		reg.register(HealthCheck({ name: 'a', check: async () => ({ status: 'UP' }) }));
		reg.register(HealthCheck({ name: 'b', check: async () => ({ status: 'UP' }) }));

		const r = await reg.runAll();
		expect(r.overall).toBe('UP');
		expect(Object.keys(r.components).sort()).toEqual(['a', 'b']);
		expect(r.components.a.status).toBe('UP');
	});

	it('aggregates DOWN if any check is DOWN, DEGRADED if any is DEGRADED otherwise', async () => {
		const reg = HealthRegistry();
		reg.register(HealthCheck({ name: 'ok', check: async () => ({ status: 'UP' }) }));
		reg.register(
			HealthCheck({ name: 'slow', check: async () => ({ status: 'DEGRADED', error: 'slow' }) })
		);
		reg.register(
			HealthCheck({ name: 'bad', check: async () => ({ status: 'DOWN', error: 'broke' }) })
		);

		const r = await reg.runAll();
		expect(r.overall).toBe('DOWN');
		expect(r.components.bad.error).toBe('broke');
	});

	it('reports a hung check as DOWN with error "timeout"', async () => {
		const reg = HealthRegistry({ defaultTimeoutMs: 20 });
		reg.register(
			HealthCheck({
				name: 'hangs',
				check: () => new Promise(() => {}) // never resolves
			})
		);

		const r = await reg.runAll();
		expect(r.components.hangs.status).toBe('DOWN');
		expect(r.components.hangs.error).toBe('timeout');
	});

	it('captures a thrown error from a check as DOWN with the message', async () => {
		const reg = HealthRegistry();
		reg.register(
			HealthCheck({
				name: 'throws',
				check: async () => {
					throw new Error('boom');
				}
			})
		);

		const r = await reg.runAll();
		expect(r.components.throws.status).toBe('DOWN');
		expect(r.components.throws.error).toBe('boom');
	});

	it('caches the aggregated result for the configured TTL', async () => {
		const reg = HealthRegistry({ cacheTtlMs: 60_000 });
		const check = vi.fn(async () => ({ status: 'UP' as const }));
		reg.register(HealthCheck({ name: 'cached', check }));

		await reg.runAll();
		await reg.runAll();
		await reg.runAll();
		expect(check).toHaveBeenCalledTimes(1);
	});

	it('shares a single in-flight runAll across concurrent callers', async () => {
		const reg = HealthRegistry();
		const check = vi.fn(
			() =>
				new Promise<{ status: 'UP' }>((resolve) => {
					setTimeout(() => resolve({ status: 'UP' }), 5);
				})
		);
		reg.register(HealthCheck({ name: 'single', check }));

		const [a, b, c] = await Promise.all([reg.runAll(), reg.runAll(), reg.runAll()]);
		expect(check).toHaveBeenCalledTimes(1);
		expect(a).toBe(b);
		expect(b).toBe(c);
	});

	it('returns UP with empty components when no checks are registered', async () => {
		const reg = HealthRegistry();
		const r = await reg.runAll();
		expect(r.overall).toBe('UP');
		expect(r.components).toEqual({});
	});

	it('respects per-check timeoutMs overrides', async () => {
		const reg = HealthRegistry({ defaultTimeoutMs: 10_000 });
		reg.register(
			HealthCheck({
				name: 'fast-timeout',
				timeoutMs: 20,
				check: () => new Promise(() => {})
			})
		);
		const r = await reg.runAll();
		expect(r.components['fast-timeout'].status).toBe('DOWN');
		expect(r.components['fast-timeout'].error).toBe('timeout');
	});
});
```

### File: `src/lib/server/health/provide-health-registry.ts`

```typescript
import { providerCtx, providerCtxSafe } from '../util/provider/provider-ctx.js';

import { HealthCheckSym, type HealthCheck } from './health-check.js';
import { HealthRegistry, type HealthRegistry as IHealthRegistry } from './health-registry.js';

export interface HealthRegistryCtx {
	healthRegistry: IHealthRegistry;
}

/**
 * Access the current `HealthRegistry` from provider context.
 *
 * Mirrors existing accessors like `appContext()`. Throws via the
 * strict context proxy if no registry is present.
 */
export function healthRegistry(): IHealthRegistry {
	return providerCtx<HealthRegistryCtx>().healthRegistry;
}

/**
 * Access the current `HealthRegistry` safely (returns undefined if not present).
 */
export function healthRegistrySafe(): IHealthRegistry | undefined {
	return providerCtxSafe<HealthRegistryCtx>().healthRegistry;
}

/**
 * Late-running provider: walks the assembled context, pulls out
 * `[HealthCheckSym]` from each top-level value, and builds a
 * `HealthRegistry`.
 *
 * Append after every other service provider in the chain (see
 * `aws-app-context.ts`, `dev-app-context.ts`). Top-level keys only —
 * no deep traversal.
 */
export function provideHealthRegistry(ctx: object): HealthRegistryCtx {
	const registry = HealthRegistry();
	for (const value of Object.values(ctx)) {
		const check = (value as { [HealthCheckSym]?: HealthCheck } | null | undefined)?.[
			HealthCheckSym
		];
		if (check != null) {
			registry.register(check);
		}
	}
	return { healthRegistry: registry };
}
```

### File: `src/lib/server/health/provide-health-registry.test.ts`

```typescript
import { describe, expect, it } from 'vitest';

import { HealthCheck, HealthCheckSym } from './health-check.js';
import { provideHealthRegistry } from './provide-health-registry.js';

describe('provideHealthRegistry', () => {
	it('discovers checks from top-level context values via HealthCheckSym', () => {
		const dbCheck = HealthCheck({ name: 'dynamodb', check: async () => ({ status: 'UP' }) });
		const ceCheck = HealthCheck({
			name: 'credential-engine',
			check: async () => ({ status: 'UP' })
		});

		const ctx = {
			db: { table: 'jobs', [HealthCheckSym]: dbCheck },
			skillSearchService: { search() {}, [HealthCheckSym]: ceCheck }
		};

		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(2);
	});

	it('skips values that do not carry the symbol', () => {
		const ctx = {
			logger: { info() {} },
			timeService: { nowMs: () => 0 },
			db: {
				table: 'jobs',
				[HealthCheckSym]: HealthCheck({ name: 'dynamodb', check: async () => ({ status: 'UP' }) })
			}
		};

		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(1);
	});

	it('handles primitive and nullish context values without throwing', () => {
		const ctx = {
			n: 42,
			s: 'foo',
			empty: null,
			undef: undefined,
			withCheck: {
				[HealthCheckSym]: HealthCheck({ name: 'x', check: async () => ({ status: 'UP' }) })
			}
		};

		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(1);
	});

	it('builds an empty registry when no values carry the symbol', () => {
		const ctx = { logger: {}, db: {}, skillSearchService: {} };
		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(0);
	});

	it('does NOT recurse into nested objects', () => {
		const nested = HealthCheck({ name: 'nested', check: async () => ({ status: 'UP' }) });
		const ctx = {
			services: { inner: { [HealthCheckSym]: nested } }
		};
		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(0);
	});
});
```

## Validate

```bash
pnpm check
pnpm test:vitest src/lib/server/health/health-check.test.ts src/lib/server/health/health-registry.test.ts src/lib/server/health/provide-health-registry.test.ts
```

## Definition of done

- 6 new files under `src/lib/server/health/` (3 modules + 3 test files), all passing.
- No changes outside `src/lib/server/health/`.
- No new `// eslint-disable`, no `it.skip`, no `// TODO:`.
- `pnpm check` and targeted tests pass.
