# Phase 1: Type update + API client function

## Scope of phase

- Update `Skill` type to include optional `description` field
- Create `src/lib/clients/skill-search-client.ts` with `searchSkills` function
- Add mapping from `SkillSearchResult` API response to `Skill` type

## Code Organization Reminders

- Keep client functions pure (no side effects)
- Handle fetch errors and response validation
- Use existing `Skill` type, don't create new domain types

## Style conventions

- **Type safety** — Use `Skill` type from existing module
- **Error handling** — Throw on HTTP errors, let caller handle
- **Mapping** — Explicit field mapping in response transformation

## Implementation Details

### 1.1 Update `src/lib/types/job-profile.ts`

Add `description` to `Skill` interface:

```typescript
// ... existing imports ...

export interface Skill {
	name: string;
	url: string;
	ctid?: string;
	description?: string; // NEW: From CE search results
}

// ... rest of file ...
```

### 1.2 Create `src/lib/clients/skill-search-client.ts`

```typescript
import type { Skill } from '$lib/types/job-profile';

/**
 * Response from POST /api/skill-search
 */
interface SkillSearchApiResponse {
	results: Array<{
		id: string;
		name: string;
		uri: string;
		ctid?: string;
		description?: string;
	}>;
	meta: {
		query: string;
		count: number;
		limit: number;
	};
}

/**
 * Search for skills via the skill search API.
 *
 * @param query - Search query (min 2 chars recommended)
 * @param limit - Max results (1-100, default 20)
 * @returns Promise<Skill[]> - Matching skills mapped to Skill type
 * @throws Error on network failure or non-OK response
 */
export async function searchSkills(query: string, limit = 20): Promise<Skill[]> {
	const response = await fetch('/api/skill-search', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, limit })
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => 'Unknown error');
		throw new Error(`Search failed (${response.status}): ${errorText}`);
	}

	const data: SkillSearchApiResponse = await response.json();

	// Map SkillSearchResult -> Skill (uri -> url)
	return data.results.map((result) => ({
		name: result.name,
		url: result.uri,
		ctid: result.ctid,
		description: result.description
	}));
}
```

### 1.3 Create `src/lib/clients/skill-search-client.test.ts`

```typescript
import { describe, expect, it, vi } from 'vitest';
import { searchSkills } from './skill-search-client';

describe('searchSkills', () => {
	it('returns mapped skills on success', async () => {
		const mockResponse = {
			results: [
				{
					id: '1',
					name: 'JavaScript',
					uri: 'https://ce.com/js',
					ctid: 'ce-js',
					description: 'JS programming'
				},
				{ id: '2', name: 'TypeScript', uri: 'https://ce.com/ts' }
			],
			meta: { query: 'script', count: 2, limit: 20 }
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse
		});

		const skills = await searchSkills('script');

		expect(skills).toHaveLength(2);
		expect(skills[0]).toEqual({
			name: 'JavaScript',
			url: 'https://ce.com/js', // uri -> url
			ctid: 'ce-js',
			description: 'JS programming'
		});
		expect(skills[1]).toEqual({
			name: 'TypeScript',
			url: 'https://ce.com/ts',
			ctid: undefined,
			description: undefined
		});
	});

	it('throws on non-ok response', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			text: async () => 'Internal error'
		});

		await expect(searchSkills('test')).rejects.toThrow('Search failed (500)');
	});

	it('uses custom limit', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ results: [], meta: { query: 'test', count: 0, limit: 5 } })
		});
		global.fetch = mockFetch;

		await searchSkills('test', 5);

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.limit).toBe(5);
	});
});
```

## Tests

- `skill-search-client.test.ts` — Verify fetch, response mapping, error handling
- TypeScript compilation confirms `Skill` type update

## Validate

```bash
pnpm check
pnpm test:vitest
```

Verify:

- TypeScript compiles with `description` field in `Skill`
- Client tests pass
- No type errors in client or tests
