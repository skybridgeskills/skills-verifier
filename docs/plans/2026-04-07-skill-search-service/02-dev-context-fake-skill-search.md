# Phase 2: Dev context + fake skill search

## Scope of phase

- Update `dev-app-context.ts` to accept env parameter and parse `DevAppEnv`
- Create `services/skill-search/` directory with port, DTOs, and fake adapter
- Implement conditional logic: use fake skill search unless both CE vars are set
- Add `provideFakeSkillSearchService` provider function
- Add `skillSearchService` to `AppContext` interface

## Code Organization Reminders

- Place port interface and ZodFactory DTOs in `skill-search-service.ts` at top
- One adapter per file with co-located tests
- Provider function separate from adapter implementation
- Keep files under ~200 lines

## Style conventions

- **ZodFactory** for all DTOs crossing the port boundary
- **Factory functions** for adapters, returning `{ search: ... }` objects
- **Provider functions** return `SkillSearchServiceCtx` shape
- **Env parameter** — parse from passed env, not `process.env`
- **No classes** for new services

## Implementation Details

### 2.1 Create `src/lib/server/services/skill-search/skill-search-service.ts`

```typescript
import { ZodFactory } from '$lib/server/util/zod-factory.js';
import z from 'zod';
import { providerCtx } from '$lib/server/util/provider/provider-ctx.js';

// =================================================================================================
// DTOs (ZodFactory)

export const SkillSearchQuery = ZodFactory(
	z.object({
		query: z.string().min(1).max(200),
		limit: z.number().int().min(1).max(100).default(20)
	})
);
export type SkillSearchQuery = ReturnType<typeof SkillSearchQuery>;

export const SkillSearchResult = ZodFactory(
	z.object({
		id: z.string(),
		name: z.string(),
		uri: z.string().url(),
		ctid: z.string().optional(),
		description: z.string().optional()
	})
);
export type SkillSearchResult = ReturnType<typeof SkillSearchResult>;

// =================================================================================================
// Port interface

export interface SkillSearchService {
	/**
	 * Search for skills by query string.
	 * Returns array of results or throws on unrecoverable errors.
	 */
	search(query: SkillSearchQuery): Promise<SkillSearchResult[]>;
}

// =================================================================================================
// Context type

export interface SkillSearchServiceCtx {
	skillSearchService: SkillSearchService;
}

// =================================================================================================
// Helper to access from context

export function skillSearchService(): SkillSearchService {
	return providerCtx<SkillSearchServiceCtx>().skillSearchService;
}
```

### 2.2 Create `src/lib/server/services/skill-search/fake-skill-search-service.ts`

```typescript
import {
	SkillSearchResult,
	type SkillSearchQuery,
	type SkillSearchService
} from './skill-search-service.js';

// Hardcoded curated skills for local development
const FAKE_SKILLS = [
	{
		id: '1',
		name: 'JavaScript Programming',
		uri: 'https://example.com/skills/js',
		description: 'Writing JavaScript code'
	},
	{
		id: '2',
		name: 'TypeScript Development',
		uri: 'https://example.com/skills/ts',
		description: 'Type-safe JavaScript development'
	},
	{
		id: '3',
		name: 'React Framework',
		uri: 'https://example.com/skills/react',
		description: 'Building UIs with React'
	},
	{
		id: '4',
		name: 'Node.js Backend',
		uri: 'https://example.com/skills/nodejs',
		description: 'Server-side JavaScript'
	},
	{
		id: '5',
		name: 'Database Design',
		uri: 'https://example.com/skills/db',
		description: 'Designing relational databases'
	},
	{
		id: '6',
		name: 'API Development',
		uri: 'https://example.com/skills/api',
		description: 'REST and GraphQL API design'
	},
	{
		id: '7',
		name: 'Cloud Infrastructure',
		uri: 'https://example.com/skills/cloud',
		description: 'AWS/GCP/Azure deployment'
	},
	{
		id: '8',
		name: 'DevOps Practices',
		uri: 'https://example.com/skills/devops',
		description: 'CI/CD and automation'
	}
];

/**
 * Fake skill search service for local development and testing.
 * Returns filtered hardcoded list based on query string.
 */
export function FakeSkillSearchService(): SkillSearchService {
	return {
		async search(query: SkillSearchQuery): Promise<SkillSearchResult[]> {
			const searchLower = query.query.toLowerCase();
			const matches = FAKE_SKILLS.filter(
				(skill) =>
					skill.name.toLowerCase().includes(searchLower) ||
					(skill.description?.toLowerCase().includes(searchLower) ?? false)
			);

			// Return limited results, applying ZodFactory validation
			return matches.slice(0, query.limit).map((skill) => SkillSearchResult(skill));
		}
	};
}
```

### 2.3 Create `src/lib/server/services/skill-search/provide-fake-skill-search-service.ts`

```typescript
import { FakeSkillSearchService } from './fake-skill-search-service.js';
import type { SkillSearchServiceCtx } from './skill-search-service.js';

/**
 * Provider for fake skill search service.
 * Used in test and dev contexts when CE is not configured.
 */
export function provideFakeSkillSearchService(): SkillSearchServiceCtx {
	return {
		skillSearchService: FakeSkillSearchService()
	};
}
```

### 2.4 Create `src/lib/server/services/skill-search/fake-skill-search-service.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
import { FakeSkillSearchService } from './fake-skill-search-service.js';
import { SkillSearchQuery } from './skill-search-service.js';

describe('FakeSkillSearchService', () => {
	const service = FakeSkillSearchService();

	it('returns empty array for non-matching query', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'xyznonexistent' }));
		expect(results).toEqual([]);
	});

	it('returns matching skills by name', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'JavaScript' }));
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].name).toContain('JavaScript');
	});

	it('returns matching skills by description', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'server' }));
		expect(results.length).toBeGreaterThan(0);
	});

	it('respects limit parameter', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'a', limit: 2 }));
		expect(results.length).toBeLessThanOrEqual(2);
	});

	it('returns valid SkillSearchResult objects', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'React' }));
		expect(results.length).toBeGreaterThan(0);

		for (const result of results) {
			expect(result.id).toBeDefined();
			expect(result.name).toBeDefined();
			expect(result.uri).toMatch(/^https?:\/\//);
		}
	});
});
```

### 2.5 Update `src/lib/server/app-context.ts`

Add `skillSearchService` to `AppContext` interface:

```typescript
import type { SkillSearchService } from './services/skill-search/skill-search-service.js';

export interface AppContext {
	timeService: TimeService;
	idService: IdService;
	frameworkClient: FrameworkClient;
	database: StorageDatabase;
	skillSearchService: SkillSearchService; // NEW
}
```

### 2.6 Update `src/lib/server/dev-app-context.ts`

```typescript
import { ZodFactory } from '$lib/server/util/zod-factory.js';
import z from 'zod';

// ... existing imports ...

import { provideFakeSkillSearchService } from './services/skill-search/provide-fake-skill-search-service.js';

// Dev-specific env schema
const DevAppEnv = ZodFactory(
	z.object({
		CREDENTIAL_ENGINE_SEARCH_URL: z.string().optional(),
		CREDENTIAL_ENGINE_API_KEY: z.string().optional()
	})
);
type DevAppEnv = ReturnType<typeof DevAppEnv>;

/**
 * Creates an AppContext for use in local development.
 * Uses fake skill search unless both CE vars are set.
 */
export async function DevAppContext(env?: Record<string, unknown>): Promise<AppContext> {
	// Parse optional CE env vars if env provided
	const ceEnv = env ? DevAppEnv(env) : ({} as DevAppEnv);

	const useRealCE = ceEnv.CREDENTIAL_ENGINE_API_KEY && ceEnv.CREDENTIAL_ENGINE_SEARCH_URL;

	// For now, always use fake (real CE will be Phase 3)
	// TODO: Phase 3 - add conditional real CE provider

	return Providers(
		RealTimeServiceCtx,
		RealIdServiceCtx,
		FrameworkClientCtx,
		StorageDatabaseCtx,
		provideFakeSkillSearchService // Always fake for now
	)() as AppContext;
}
```

### 2.7 Update `src/lib/server/test-app-context.ts`

```typescript
import { provideFakeSkillSearchService } from './services/skill-search/provide-fake-skill-search-service.js';

// ... existing setup ...

export const testAppProviders = Providers(
	FakeTimeServiceCtx,
	FakeIdServiceCtx,
	FrameworkClientCtx,
	TestStorageDatabaseCtx,
	provideFakeSkillSearchService // NEW
);

export async function TestAppContext(_env?: Record<string, unknown>): Promise<AppContext> {
	return (await testAppProviders()) as AppContext;
}
```

## Tests

All tests should pass:

- `fake-skill-search-service.test.ts` — Unit tests for fake adapter
- Existing tests using `TestAppContext` should still work (fake search added)
- Dev server starts and context builds correctly

## Validate

```bash
pnpm check
pnpm test:vitest
```

Verify:

- TypeScript compiles
- `AppContext` now includes `skillSearchService`
- `TestAppContext` includes fake skill search
- Dev server starts with `CONTEXT=dev` (default)
- Fake skill search service tests pass
