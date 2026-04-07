# Phase 5: API route

## Scope of phase

- Create `src/routes/api/skill-search/+server.ts`
- Implement `POST` endpoint that validates input, calls service, returns JSON
- Add input validation using ZodFactory DTOs
- Add tests using `runInContext` + `TestAppContext`

## Code Organization Reminders

- Route handler at top of file, helpers at bottom
- Input validation before service call
- Return proper HTTP status codes
- Tests co-located or in `+server.test.ts`

## Style conventions

- **ZodFactory** for request/response validation
- **Early return** pattern for error handling
- **JSON responses** with appropriate status codes
- **No business logic** in route — delegate to service

## Implementation Details

### 5.1 Create `src/routes/api/skill-search/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ZodFactory } from '$lib/server/util/zod-factory.js';
import z from 'zod';
import {
	SkillSearchQuery,
	SkillSearchResult,
	skillSearchService
} from '$lib/server/services/skill-search/skill-search-service.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';
import { appContext } from '$lib/server/app-context.js';

// =================================================================================================
// Request/Response DTOs for HTTP layer

const SkillSearchRequest = ZodFactory(
	z.object({
		query: z.string().min(1).max(200),
		limit: z.number().int().min(1).max(100).default(20)
	})
);
type SkillSearchRequest = ReturnType<typeof SkillSearchRequest>;

const SkillSearchResponse = ZodFactory(
	z.object({
		results: z.array(SkillSearchResult.schema),
		meta: z.object({
			query: z.string(),
			count: z.number().int(),
			limit: z.number().int()
		})
	})
);

// =================================================================================================
// POST handler

export const POST: RequestHandler = async ({ request }) => {
	// Parse request body
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	// Validate request
	let searchRequest: SkillSearchRequest;
	try {
		searchRequest = SkillSearchRequest(body);
	} catch (error) {
		return json(
			{ error: 'Invalid request', details: error instanceof Error ? error.message : String(error) },
			{ status: 400 }
		);
	}

	// Call service within context
	try {
		const results = await runInContext(appContext(), async () => {
			const service = skillSearchService();
			return service.search(
				SkillSearchQuery({
					query: searchRequest.query,
					limit: searchRequest.limit
				})
			);
		});

		// Build response
		const response = SkillSearchResponse({
			results,
			meta: {
				query: searchRequest.query,
				count: results.length,
				limit: searchRequest.limit
			}
		});

		return json(response);
	} catch (error) {
		// Log error but return generic message
		console.error('Skill search error:', error);
		return json({ error: 'Search failed' }, { status: 500 });
	}
};

// =================================================================================================
// GET handler (optional alternative for simple queries)

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);

	if (!query || query.length < 1) {
		return json({ error: 'Missing or invalid query parameter "q"' }, { status: 400 });
	}

	if (limit < 1 || limit > 100) {
		return json({ error: 'Invalid limit parameter' }, { status: 400 });
	}

	try {
		const results = await runInContext(appContext(), async () => {
			const service = skillSearchService();
			return service.search(SkillSearchQuery({ query, limit }));
		});

		return json(
			SkillSearchResponse({
				results,
				meta: {
					query,
					count: results.length,
					limit
				}
			})
		);
	} catch (error) {
		console.error('Skill search error:', error);
		return json({ error: 'Search failed' }, { status: 500 });
	}
};
```

### 5.2 Create `src/routes/api/skill-search/+server.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
import { POST, GET } from './+server.js';
import { TestAppContext } from '$lib/server/test-app-context.js';
import { runInContext } from '$lib/server/util/provider/provider-ctx.js';

// Mock SvelteKit request/response types
function createMockRequest(body: unknown): Request {
	return new Request('http://localhost/api/skill-search', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

describe('/api/skill-search', () => {
	describe('POST', () => {
		it('returns results for valid query', async () => {
			const ctx = await TestAppContext();

			await runInContext(ctx, async () => {
				const request = createMockRequest({ query: 'JavaScript', limit: 5 });
				const response = await POST({
					request,
					params: {},
					url: new URL(request.url),
					route: { id: '/api/skill-search' },
					isDataRequest: false
				});

				expect(response.status).toBe(200);
				const body = await response.json();
				expect(body.results).toBeDefined();
				expect(body.results.length).toBeGreaterThan(0);
				expect(body.meta.query).toBe('JavaScript');
			});
		});

		it('returns 400 for invalid JSON', async () => {
			const request = new Request('http://localhost/api/skill-search', {
				method: 'POST',
				body: 'not valid json'
			});

			const response = await POST({
				request,
				params: {},
				url: new URL(request.url),
				route: { id: '/api/skill-search' },
				isDataRequest: false
			});
			expect(response.status).toBe(400);
		});

		it('returns 400 for missing query', async () => {
			const request = createMockRequest({ limit: 10 });

			const ctx = await TestAppContext();
			await runInContext(ctx, async () => {
				const response = await POST({
					request,
					params: {},
					url: new URL(request.url),
					route: { id: '/api/skill-search' },
					isDataRequest: false
				});
				expect(response.status).toBe(400);
			});
		});

		it('returns 400 for query too long', async () => {
			const request = createMockRequest({ query: 'a'.repeat(201) });

			const ctx = await TestAppContext();
			await runInContext(ctx, async () => {
				const response = await POST({
					request,
					params: {},
					url: new URL(request.url),
					route: { id: '/api/skill-search' },
					isDataRequest: false
				});
				expect(response.status).toBe(400);
			});
		});

		it('respects limit parameter', async () => {
			const ctx = await TestAppContext();

			await runInContext(ctx, async () => {
				const request = createMockRequest({ query: 'a', limit: 2 });
				const response = await POST({
					request,
					params: {},
					url: new URL(request.url),
					route: { id: '/api/skill-search' },
					isDataRequest: false
				});
				const body = await response.json();
				expect(body.results.length).toBeLessThanOrEqual(2);
				expect(body.meta.limit).toBe(2);
			});
		});
	});

	describe('GET', () => {
		it('returns results for query param', async () => {
			const ctx = await TestAppContext();

			await runInContext(ctx, async () => {
				const url = new URL('http://localhost/api/skill-search?q=JavaScript&limit=3');
				const response = await GET({
					params: {},
					url,
					route: { id: '/api/skill-search' },
					isDataRequest: false
				});

				expect(response.status).toBe(200);
				const body = await response.json();
				expect(body.meta.query).toBe('JavaScript');
				expect(body.meta.limit).toBe(3);
			});
		});

		it('returns 400 for missing query', async () => {
			const url = new URL('http://localhost/api/skill-search');
			const response = await GET({
				params: {},
				url,
				route: { id: '/api/skill-search' },
				isDataRequest: false
			});
			expect(response.status).toBe(400);
		});
	});
});
```

### 5.3 Add type declarations for test helpers

If needed, add type helpers in test file or use `as any` sparingly for SvelteKit's complex handler types.

## Tests

All tests should pass:

- `+server.test.ts` — API route tests with mocked requests
- Route returns correct status codes
- Valid requests return `SkillSearchResult[]` in expected format
- Invalid requests return 400 with error message

## Validate

```bash
pnpm check
CONTEXT=test pnpm test:vitest
```

Verify:

- TypeScript compiles
- Route handler type checks
- All route tests pass
- POST and GET handlers work as expected
- Response format matches `SkillSearchResponse` schema

## Manual testing (dev)

```bash
# Start dev server
pnpm dev

# Test POST endpoint
curl -X POST http://localhost:5173/api/skill-search \
  -H "Content-Type: application/json" \
  -d '{"query": "JavaScript", "limit": 5}'

# Test GET endpoint
curl "http://localhost:5173/api/skill-search?q=TypeScript&limit=3"
```

## Error handling

Expected behaviors:

- Missing query → 400 with error message
- Invalid JSON → 400
- Query too long (>200 chars) → 400
- Service error → 500 with generic message (details logged server-side)
- Valid request → 200 with results array + meta object
