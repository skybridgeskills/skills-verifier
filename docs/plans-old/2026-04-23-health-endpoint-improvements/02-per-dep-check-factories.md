# Phase 2 — Per-dependency check factories

## Scope of phase

Create check factories for the external dependencies in skills-verifier:

1. **`DynamoDBHealthCheck`** — Probes DynamoDB connectivity via `DescribeTable`
2. **`HttpHealthCheck`** — Probes HTTP services via `GET /health` (for Credential Engine API)

**In scope:** the two check factories + their tests.

**Out of scope:**

- Core health abstractions (Phase 1)
- Response builder (Phase 3)
- Service wiring (Phase 4)

This phase depends on Phase 1 (`HealthCheck`, `HealthCheckSym` from `health-check.ts`).

## Code organization reminders

- One check per file in `src/lib/server/health/checks/`
- Tests next to implementation
- Keep helper functions at the bottom
- Use `nowMs()` from time service for duration measurement

## Sub-agent reminders

- **Do not commit.**
- **Do not expand scope.** No edits to service files yet.
- **Do not suppress warnings.**
- **Do not skip or weaken tests.**

## Implementation details

### File: `src/lib/server/health/checks/dynamodb-health-check.ts`

Probes DynamoDB using `DescribeTableCommand` from `@aws-sdk/lib-dynamodb`.

```typescript
import { DescribeTableCommand, type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { nowMs } from '../../services/time-service/time-service.js';
import { HealthCheck, HealthCheckSym, type HealthCheckResult } from '../health-check.js';

export interface DynamoDBHealthCheckOpts {
	/** DynamoDB document client */
	client: DynamoDBDocumentClient;
	/** Table name to describe (probes connectivity + table existence) */
	tableName: string;
	/** Optional override for the check name (default: 'dynamodb') */
	name?: string;
}

/**
 * Health check factory for DynamoDB.
 *
 * Sends a `DescribeTable` command to verify connectivity. Returns:
 * - `UP` if the table exists and is accessible
 * - `DOWN` if there's a connection error or the table doesn't exist
 */
export function DynamoDBHealthCheck(opts: DynamoDBHealthCheckOpts) {
	const { client, tableName, name = 'dynamodb' } = opts;

	async function check(): Promise<HealthCheckResult> {
		const startedAt = nowMs();
		try {
			await client.send(new DescribeTableCommand({ TableName: tableName }));
			return { status: 'UP', details: { tableName, durationMs: nowMs() - startedAt } };
		} catch (err) {
			const error = err instanceof Error ? err.message : String(err);
			return {
				status: 'DOWN',
				error,
				details: { tableName, durationMs: nowMs() - startedAt }
			};
		}
	}

	return HealthCheck({ name, check });
}

/** Convenience symbol export for service files */
export { HealthCheckSym };
```

### File: `src/lib/server/health/checks/dynamodb-health-check.test.ts`

```typescript
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { DynamoDBHealthCheck, HealthCheckSym } from './dynamodb-health-check.js';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('DynamoDBHealthCheck', () => {
	beforeEach(() => {
		ddbMock.reset();
	});

	afterEach(() => {
		ddbMock.restore();
	});

	it('returns UP when DescribeTable succeeds', async () => {
		ddbMock.onAnyCommand().resolves({});

		const check = DynamoDBHealthCheck({
			client: ddbMock as unknown as DynamoDBDocumentClient,
			tableName: 'test-table'
		});

		const result = await check.check();
		expect(result.status).toBe('UP');
		expect(result.details?.tableName).toBe('test-table');
		expect(result.details?.durationMs).toBeGreaterThanOrEqual(0);
	});

	it('returns DOWN when DescribeTable fails', async () => {
		ddbMock.onAnyCommand().rejects(new Error('Connection refused'));

		const check = DynamoDBHealthCheck({
			client: ddbMock as unknown as DynamoDBDocumentClient,
			tableName: 'test-table'
		});

		const result = await check.check();
		expect(result.status).toBe('DOWN');
		expect(result.error).toContain('Connection refused');
	});

	it('uses custom name when provided', () => {
		const check = DynamoDBHealthCheck({
			client: ddbMock as unknown as DynamoDBDocumentClient,
			tableName: 'test-table',
			name: 'my-dynamodb'
		});

		expect(check.name).toBe('my-dynamodb');
	});

	it('exposes HealthCheckSym for discovery', () => {
		// Services will attach the check under this symbol
		expect(typeof HealthCheckSym).toBe('symbol');
	});
});
```

### File: `src/lib/server/health/checks/http-health-check.ts`

Probes HTTP services with a simple GET request. Used for Credential Engine API.

```typescript
import { nowMs } from '../../services/time-service/time-service.js';
import { HealthCheck, type HealthCheckResult } from '../health-check.js';

export interface HttpHealthCheckOpts {
	/** Unique name for this HTTP dependency (e.g., 'credential-engine') */
	name: string;
	/** Base URL of the service (e.g., 'https://sandbox.credentialengine.org') */
	baseUrl: string;
	/** Health check path (default: '/health') */
	path?: string;
	/** Optional API key for authorization */
	apiKey?: string;
}

/**
 * Health check factory for HTTP dependencies.
 *
 * Sends a GET request to `{baseUrl}{path}`. Returns:
 * - `UP` on 2xx responses
 * - `DOWN` on 5xx responses or network errors
 * - `DEGRADED` on other status codes (3xx, 4xx)
 */
export function HttpHealthCheck(opts: HttpHealthCheckOpts) {
	const { name, baseUrl, path = '/health', apiKey } = opts;

	// Normalize base URL (remove trailing slash)
	const normalizedBase = baseUrl.replace(/\/$/, '');
	const url = `${normalizedBase}${path}`;

	async function check(): Promise<HealthCheckResult> {
		const startedAt = nowMs();
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers['Authorization'] = `Bearer ${apiKey}`;
			}

			const response = await fetch(url, {
				method: 'GET',
				headers,
				// Short timeout for health checks — the registry will also enforce its own
				signal: AbortSignal.timeout(5000)
			});

			const durationMs = nowMs() - startedAt;

			if (response.ok) {
				return {
					status: 'UP',
					details: { url, statusCode: response.status, durationMs }
				};
			}

			if (response.status >= 500) {
				return {
					status: 'DOWN',
					error: `HTTP ${response.status} ${response.statusText}`,
					details: { url, statusCode: response.status, durationMs }
				};
			}

			// 3xx or 4xx — service is up but health endpoint not found or requires auth
			return {
				status: 'DEGRADED',
				error: `HTTP ${response.status} ${response.statusText}`,
				details: { url, statusCode: response.status, durationMs }
			};
		} catch (err) {
			const error = err instanceof Error ? err.message : String(err);
			return {
				status: 'DOWN',
				error,
				details: { url, durationMs: nowMs() - startedAt }
			};
		}
	}

	return HealthCheck({ name, check });
}
```

### File: `src/lib/server/health/checks/http-health-check.test.ts`

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { HttpHealthCheck } from './http-health-check.js';

describe('HttpHealthCheck', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it('returns UP on 200 OK', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('UP');
		expect(result.details?.statusCode).toBe(200);
	});

	it('returns UP on any 2xx', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 204,
			statusText: 'No Content'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('UP');
	});

	it('returns DOWN on 5xx', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 503,
			statusText: 'Service Unavailable'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('DOWN');
		expect(result.error).toContain('503');
	});

	it('returns DEGRADED on 4xx', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: 'Not Found'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('DEGRADED');
		expect(result.error).toContain('404');
	});

	it('returns DOWN on network error', async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error('ECONNREFUSED'));

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.status).toBe('DOWN');
		expect(result.error).toContain('ECONNREFUSED');
	});

	it('includes Authorization header when apiKey is provided', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({
			name: 'test-api',
			baseUrl: 'https://api.example.com',
			apiKey: 'my-secret-key'
		});
		await check.check();

		expect(fetch).toHaveBeenCalledWith(
			'https://api.example.com/health',
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer my-secret-key'
				})
			})
		);
	});

	it('uses custom path when provided', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({
			name: 'test-api',
			baseUrl: 'https://api.example.com',
			path: '/api/health'
		});
		await check.check();

		expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/health', expect.any(Object));
	});

	it('normalizes trailing slashes in baseUrl', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({
			name: 'test-api',
			baseUrl: 'https://api.example.com/',
			path: '/health'
		});
		await check.check();

		expect(fetch).toHaveBeenCalledWith('https://api.example.com/health', expect.any(Object));
	});

	it('captures duration in details', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: 'OK'
		} as Response);

		const check = HttpHealthCheck({ name: 'test-api', baseUrl: 'https://api.example.com' });
		const result = await check.check();

		expect(result.details?.durationMs).toBeGreaterThanOrEqual(0);
	});
});
```

## Validate

```bash
pnpm check
pnpm test:vitest src/lib/server/health/checks/
```

## Definition of done

- 4 new files under `src/lib/server/health/checks/` (2 modules + 2 test files), all passing.
- No edits outside `src/lib/server/health/checks/`.
- No new `// eslint-disable`, no `it.skip`, no `// TODO:`.
- `pnpm check` and tests pass.
