# Phase 5 — SvelteKit readiness adapter

## Scope of phase

Create the SvelteKit GET handler that calls `buildReadinessResponse()` and translates the result to a SvelteKit response.

**In scope:**

1. `src/lib/server/health/handle-readiness-get.ts` — SvelteKit handler
2. `src/lib/server/health/handle-readiness-get.test.ts` — Unit tests
3. `src/routes/health/ready/+server.ts` — Route file that re-exports the handler

**Out of scope:**

- Core health modules (Phases 1-3)
- Service wiring (Phase 4)
- App context wiring (Phase 6)

## Code organization reminders

- One handler file + test in `src/lib/server/health/`
- One route file in `src/routes/health/ready/`
- Tests should inject context via `runInContext(...)`

## Sub-agent reminders

- **Do not commit.**
- **Do not expand scope.** No changes to other hooks or middleware.
- **Do not suppress warnings.**
- **Do not skip or weaken tests.**

## Implementation details

### File: `src/lib/server/health/handle-readiness-get.ts`

````typescript
import { json } from '@sveltejs/kit';

import { buildReadinessResponse } from './build-readiness-response.js';

/**
 * SvelteKit GET handler for the readiness probe (`GET /health/ready`).
 *
 * Use from a SvelteKit route file:
 *
 * ```ts
 * // src/routes/health/ready/+server.ts
 * export { handleReadinessGet as GET } from '$lib/server/health/handle-readiness-get.js';
 * ```
 *
 * Assumes the request is already inside an app context (the app's
 * `hooks.server.ts` ensures that).
 *
 * Returns 503 on overall DOWN, 200 otherwise.
 */
export async function handleReadinessGet() {
	const { body, httpStatus } = await buildReadinessResponse();
	return json(body, { status: httpStatus });
}
````

### File: `src/lib/server/health/handle-readiness-get.test.ts`

```typescript
import { runInContext } from '../util/provider/provider-ctx.js';
import { describe, expect, it } from 'vitest';

import type { HealthRegistry } from './health-registry.js';
import { handleReadinessGet } from './handle-readiness-get.js';

const startupTime = new Date('2026-04-22T10:00:00.000Z');

function ctx(reg: HealthRegistry) {
	return {
		healthRegistry: reg,
		// Mock time service
		timeService: {
			nowMs: () => startupTime.getTime(),
			nowDate: () => startupTime
		}
	};
}

describe('handleReadinessGet', () => {
	it('returns 200 when overall is UP', async () => {
		const reg: HealthRegistry = {
			register: () => {},
			size: () => 0,
			runAll: async () => ({ overall: 'UP', components: {}, runAtMs: 0 })
		};

		const res = await runInContext(ctx(reg), () => handleReadinessGet());
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe('UP');
	});

	it('returns 503 when overall is DOWN', async () => {
		const reg: HealthRegistry = {
			register: () => {},
			size: () => 1,
			runAll: async () => ({
				overall: 'DOWN',
				components: { 'credential-engine': { status: 'DOWN', durationMs: 4, error: 'timeout' } },
				runAtMs: 0
			})
		};

		const res = await runInContext(ctx(reg), () => handleReadinessGet());
		expect(res.status).toBe(503);
		const body = await res.json();
		expect(body.status).toBe('DOWN');
		expect(body.components['credential-engine'].error).toBe('timeout');
	});

	it('returns 200 on DEGRADED (not 503)', async () => {
		const reg: HealthRegistry = {
			register: () => {},
			size: () => 1,
			runAll: async () => ({
				overall: 'DEGRADED',
				components: { 'credential-engine': { status: 'DEGRADED', durationMs: 10, error: 'slow' } },
				runAtMs: 0
			})
		};

		const res = await runInContext(ctx(reg), () => handleReadinessGet());
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe('DEGRADED');
	});
});
```

### File: `src/routes/health/ready/+server.ts`

```typescript
import { handleReadinessGet } from '$lib/server/health/handle-readiness-get.js';

export const GET = handleReadinessGet;
```

## Validate

```bash
pnpm check
pnpm test:vitest src/lib/server/health/handle-readiness-get.test.ts
```

Also verify the route file works:

```bash
# Start dev server and test manually
curl http://localhost:5173/health/ready
```

## Definition of done

- 3 new files (handler + test + route), all passing
- No edits outside the specified files
- No new `// eslint-disable`, no `it.skip`, no `// TODO:`
- `pnpm check` and tests pass
