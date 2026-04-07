# Phase 3: AWS context + real skill search

## Scope of phase

- Create `aws-app-context.ts` with required CE env parsing
- Create `credential-engine/` subdirectory with CE adapter implementation
- Implement HTTP POST client for Registry Search API
- Create response mapper with fixtures
- Add `provideCredentialEngineSkillSearchService` provider

## Code Organization Reminders

- CE-specific code isolated under `credential-engine/` subdirectory
- Pure mapping functions separate from HTTP client
- Fixtures for testing without live HTTP calls
- Provider function separate from adapter

## Style conventions

- **ZodFactory** for validating CE responses (if needed)
- **Pure functions** for mapping (input: CE JSON, output: `SkillSearchResult[]`)
- **Factory function** for CE adapter taking `{ url, apiKey }` config
- **Error handling**: throw on network/auth errors, return empty array on no results
- **No classes** — use factory returning `{ search: ... }` object

## Implementation Details

### 3.1 Create `src/lib/server/aws-app-context.ts`

```typescript
import { ZodFactory } from '$lib/server/util/zod-factory.js';
import { panic } from '$lib/server/util/panic.js';
import z from 'zod';
import type { AppContext } from './app-context.js';
import { StorageDatabaseCtx } from './core/storage/storage-database-ctx.js';
import { RealIdServiceCtx } from './services/id-service/real-id-service.js';
import { RealTimeServiceCtx } from './services/time-service/real-time-service.js';
import { FrameworkClientCtx } from './clients/framework-client/framework-client.js';
import { Providers } from './util/provider/providers.js';
import { provideCredentialEngineSkillSearchService } from './services/skill-search/credential-engine/provide-credential-engine-skill-search-service.js';

// AWS-specific env schema — CE vars required
const AwsAppEnv = ZodFactory(
	z.object({
		CREDENTIAL_ENGINE_SEARCH_URL: z.string().min(1),
		CREDENTIAL_ENGINE_API_KEY: z.string().min(1)
		// Add other AWS-specific vars here (DynamoDB table, etc.)
	})
);
export type AwsAppEnv = ReturnType<typeof AwsAppEnv>;

/**
 * Creates an AppContext for AWS production environment.
 * Requires Credential Engine search configuration.
 */
export async function AwsAppContext(env: Record<string, unknown>): Promise<AppContext> {
	// Validate required CE env vars
	const parsedEnv = AwsAppEnv.parse(env);

	return Providers(
		RealTimeServiceCtx,
		RealIdServiceCtx,
		FrameworkClientCtx,
		StorageDatabaseCtx,
		// CE skill search — required for AWS
		() =>
			provideCredentialEngineSkillSearchService({
				url: parsedEnv.CREDENTIAL_ENGINE_SEARCH_URL,
				apiKey: parsedEnv.CREDENTIAL_ENGINE_API_KEY
			})
	)() as AppContext;
}
```

### 3.2 Create `src/lib/server/services/skill-search/credential-engine/credential-engine-search-request.ts`

Builds POST body for Registry Search API:

```typescript
import type { SkillSearchQuery } from '../skill-search-service.js';

/**
 * Build CE Registry Search API request body.
 *
 * Per handbook: https://credreg.net/registry/searchapi
 * Uses CTDL JSON query structure.
 */
export function buildCredentialEngineSearchRequest(query: SkillSearchQuery): unknown {
	// Base wrapper structure per CE handbook
	return {
		// Search across competency-relevant CTDL types
		'@type': [
			'ceasn:Competency', // Direct competencies
			'ceterms:Job', // Jobs with embodied competencies
			'ceterms:Occupation', // Occupations with competencies
			'ceterms:Task', // Tasks with competencies
			'ceterms:WorkRole' // Work roles with competencies
		],
		// Search term in name, description, etc.
		'search:term': query.query,
		// Pagination
		'search:skip': 0,
		'search:take': query.limit,
		// Prefer published resources
		'ceterms:ctid': 'search:anyValue'
	};
}
```

### 3.3 Create `src/lib/server/services/skill-search/credential-engine/map-credential-engine-search-response.ts`

```typescript
import { SkillSearchResult } from '../skill-search-service.js';

/**
 * CE Registry Search API response item (simplified).
 * Full CTDL structure is complex; we extract key fields.
 */
interface CEResponseItem {
	'@id': string;
	'ceterms:ctid'?: string;
	'ceasn:competencyText'?: { 'en-US': string } | string;
	'ceterms:name'?: { 'en-US': string } | string;
	'ceterms:description'?: { 'en-US': string } | string;
	// Fallback fields
	'schema:name'?: { 'en-US': string } | string;
	'schema:description'?: { 'en-US': string } | string;
}

/**
 * CE Search API response wrapper.
 */
interface CEResponse {
	data?: CEResponseItem[];
	// May include total, skip, take in some versions
}

/**
 * Extract string value from CE language map or string.
 */
function extractText(value: unknown): string | undefined {
	if (typeof value === 'string') return value;
	if (value && typeof value === 'object') {
		// CE uses language maps like { 'en-US': 'text' }
		const map = value as Record<string, string>;
		return map['en-US'] ?? map['en'] ?? Object.values(map)[0];
	}
	return undefined;
}

/**
 * Map CE Registry Search API response to our SkillSearchResult DTOs.
 * Pure function — no side effects.
 */
export function mapCredentialEngineSearchResponse(ceResponse: unknown): SkillSearchResult[] {
	const response = ceResponse as CEResponse;
	const items = response.data ?? [];

	return items.map((item) => {
		// Determine name from available fields
		const name =
			extractText(item['ceasn:competencyText']) ??
			extractText(item['ceterms:name']) ??
			extractText(item['schema:name']) ??
			'Unnamed Skill';

		const description =
			extractText(item['ceterms:description']) ?? extractText(item['schema:description']);

		return SkillSearchResult({
			id: item['@id'], // Use URI as id
			name,
			uri: item['@id'],
			ctid: item['ceterms:ctid'],
			description
		});
	});
}
```

### 3.4 Create `src/lib/server/services/skill-search/credential-engine/credential-engine-skill-search-service.ts`

```typescript
import type { SkillSearchQuery, SkillSearchResult } from '../skill-search-service.js';
import type { SkillSearchService } from '../skill-search-service.js';
import { buildCredentialEngineSearchRequest } from './credential-engine-search-request.js';
import { mapCredentialEngineSearchResponse } from './map-credential-engine-search-response.js';

export interface CEConfig {
	url: string;
	apiKey: string;
}

/**
 * Real skill search adapter using Credential Engine Registry Search API.
 *
 * HTTP POST to {url} with Authorization: Bearer {apiKey}
 * Request/response body per https://credreg.net/registry/searchapi
 */
export function CredentialEngineSkillSearchService(config: CEConfig): SkillSearchService {
	return {
		async search(query: SkillSearchQuery): Promise<SkillSearchResult[]> {
			const requestBody = buildCredentialEngineSearchRequest(query);

			const response = await fetch(config.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${config.apiKey}`
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				// Log status for debugging, but don't expose details to caller
				throw new Error(`CE search failed: ${response.status} ${response.statusText}`);
			}

			const ceResponse = await response.json();
			return mapCredentialEngineSearchResponse(ceResponse);
		}
	};
}
```

### 3.5 Create `src/lib/server/services/skill-search/credential-engine/provide-credential-engine-skill-search-service.ts`

```typescript
import { CredentialEngineSkillSearchService } from './credential-engine-skill-search-service.js';
import type { SkillSearchServiceCtx } from '../skill-search-service.js';

interface CEEnvSlice {
	url: string;
	apiKey: string;
}

/**
 * Provider for real Credential Engine skill search service.
 * Used in AWS context (required) and optionally in dev context.
 */
export function provideCredentialEngineSkillSearchService(ctx: CEEnvSlice): SkillSearchServiceCtx {
	return {
		skillSearchService: CredentialEngineSkillSearchService({
			url: ctx.url,
			apiKey: ctx.apiKey
		})
	};
}
```

### 3.6 Create fixture file `src/lib/server/services/skill-search/credential-engine/fixtures/ce-search-response.json`

```json
{
	"data": [
		{
			"@id": "https://example.com/competency/1",
			"ceterms:ctid": "ce-abc123",
			"ceasn:competencyText": {
				"en-US": "JavaScript Programming"
			},
			"ceterms:description": {
				"en-US": "Writing and maintaining JavaScript code"
			}
		},
		{
			"@id": "https://example.com/competency/2",
			"ceterms:ctid": "ce-def456",
			"ceterms:name": {
				"en-US": "TypeScript Development"
			}
		},
		{
			"@id": "https://example.com/job/3",
			"ceterms:ctid": "ce-ghi789",
			"ceterms:name": "Software Engineer",
			"ceterms:description": "Develops software using modern tools"
		}
	]
}
```

### 3.7 Create `src/lib/server/services/skill-search/credential-engine/map-credential-engine-search-response.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
import { mapCredentialEngineSearchResponse } from './map-credential-engine-search-response.js';
import ceFixture from './fixtures/ce-search-response.json' assert { type: 'json' };

describe('mapCredentialEngineSearchResponse', () => {
	it('maps CE response to SkillSearchResult DTOs', () => {
		const results = mapCredentialEngineSearchResponse(ceFixture);

		expect(results).toHaveLength(3);

		// First item: competencyText
		expect(results[0].id).toBe('https://example.com/competency/1');
		expect(results[0].name).toBe('JavaScript Programming');
		expect(results[0].ctid).toBe('ce-abc123');
		expect(results[0].description).toBe('Writing and maintaining JavaScript code');

		// Second item: ceterms:name fallback
		expect(results[1].name).toBe('TypeScript Development');

		// Third item: Job type
		expect(results[2].name).toBe('Software Engineer');
	});

	it('handles empty data array', () => {
		const result = mapCredentialEngineSearchResponse({ data: [] });
		expect(result).toEqual([]);
	});

	it('handles missing data field', () => {
		const result = mapCredentialEngineSearchResponse({});
		expect(result).toEqual([]);
	});

	it('falls back to Unnamed Skill when no name field present', () => {
		const result = mapCredentialEngineSearchResponse({
			data: [{ '@id': 'https://example.com/unknown' }]
		});
		expect(result[0].name).toBe('Unnamed Skill');
	});

	it('handles string values (not just language maps)', () => {
		const result = mapCredentialEngineSearchResponse({
			data: [
				{
					'@id': 'https://example.com/string-skill',
					'ceasn:competencyText': 'Plain String Name'
				}
			]
		});
		expect(result[0].name).toBe('Plain String Name');
	});
});
```

### 3.8 Create `src/lib/server/services/skill-search/credential-engine/credential-engine-skill-search-service.test.ts`

Note: Mark with `describe.skip` or use `vi.mock` for fetch, or use MSW (if already in project) to mock HTTP. Keep test deterministic.

```typescript
import { describe, expect, it, vi } from 'vitest';
import { CredentialEngineSkillSearchService } from './credential-engine-skill-search-service.js';
import { SkillSearchQuery } from '../skill-search-service.js';
import ceFixture from './fixtures/ce-search-response.json' assert { type: 'json' };

describe('CredentialEngineSkillSearchService', () => {
	it('calls CE API with correct headers and body', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ceFixture
		});
		global.fetch = mockFetch;

		const service = CredentialEngineSkillSearchService({
			url: 'https://ce.example.com/search',
			apiKey: 'test-api-key'
		});

		await service.search(SkillSearchQuery({ query: 'JavaScript', limit: 10 }));

		expect(mockFetch).toHaveBeenCalledWith(
			'https://ce.example.com/search',
			expect.objectContaining({
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer test-api-key'
				}
			})
		);

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body['search:term']).toBe('JavaScript');
		expect(body['search:take']).toBe(10);
	});

	it('throws on non-ok response', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
			statusText: 'Unauthorized'
		});

		const service = CredentialEngineSkillSearchService({
			url: 'https://ce.example.com/search',
			apiKey: 'bad-key'
		});

		await expect(service.search(SkillSearchQuery({ query: 'test' }))).rejects.toThrow(
			'CE search failed: 401 Unauthorized'
		);
	});
});
```

### 3.9 Update `build-app-context.ts` to call `AwsAppContext`

```typescript
case 'aws': {
  const { AwsAppContext } = await import('./aws-app-context.js');
  return AwsAppContext(env);
}
```

### 3.10 Update `dev-app-context.ts` for conditional CE

```typescript
import { provideCredentialEngineSkillSearchService } from './services/skill-search/credential-engine/provide-credential-engine-skill-search-service.js';

// ... in DevAppContext:
const useRealCE = ceEnv.CREDENTIAL_ENGINE_API_KEY && ceEnv.CREDENTIAL_ENGINE_SEARCH_URL;

return Providers(
	RealTimeServiceCtx,
	RealIdServiceCtx,
	FrameworkClientCtx,
	StorageDatabaseCtx,
	useRealCE
		? () =>
				provideCredentialEngineSkillSearchService({
					url: ceEnv.CREDENTIAL_ENGINE_SEARCH_URL!,
					apiKey: ceEnv.CREDENTIAL_ENGINE_API_KEY!
				})
		: provideFakeSkillSearchService
)() as AppContext;
```

## Tests

All tests should pass:

- `map-credential-engine-search-response.test.ts` — Unit tests for mapping pure function
- `credential-engine-skill-search-service.test.ts` — HTTP client tests with mocked fetch
- Existing tests remain green

## Validate

```bash
pnpm check
pnpm test:vitest
```

Verify:

- TypeScript compiles
- AWS context requires both CE env vars (throws ZodError if missing)
- Dev context switches between fake and real based on env
- Mapper tests pass with fixtures
- No live HTTP calls in test suite

## Security notes

- API key never logged or exposed in error messages
- Server-only env vars (no `PUBLIC_` prefix)
- Authorization header only sent to configured URL
