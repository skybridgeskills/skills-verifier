# Phase 4: Test context

## Scope of phase

- Ensure `TestAppContext` properly uses fake skill search
- Configure Vitest to use `CONTEXT=test` environment
- Add environment variable configuration for test runs
- Verify all tests use deterministic fake implementations

## Code Organization Reminders

- Test context should be self-contained and not depend on external services
- Environment configuration in `package.json` or `vitest.config.ts`
- Keep test setup simple and fast

## Style conventions

- **Fake implementations only** in test context
- **No external HTTP calls** in unit tests
- **Deterministic results** for reproducible tests

## Implementation Details

### 4.1 Update `src/lib/server/test-app-context.ts`

Already done in Phase 2, but ensure it properly accepts env parameter:

```typescript
import { ZodFactory } from '$lib/server/util/zod-factory.js';
import z from 'zod';
import { FrameworkClientCtx } from '$lib/clients/framework-client/framework-client.js';
import type { AppContext } from './app-context.js';
import { MemoryDatabase } from './core/storage/memory-database.js';
import { FakeIdServiceCtx } from './services/id-service/fake-id-service.js';
import { FakeTimeServiceCtx } from './services/time-service/fake-time-service.js';
import { Providers } from './util/provider/providers.js';
import { provideFakeSkillSearchService } from './services/skill-search/provide-fake-skill-search-service.js';

// Test-specific env schema (minimal - nothing required)
const TestAppEnv = ZodFactory(
	z
		.object({
			// Test context accepts any env vars but doesn't require any
			// This allows test-specific overrides if needed in future
		})
		.passthrough()
);

/** In-memory DB only — tests never call DynamoDB. */
const TestStorageDatabaseCtx = () => ({ database: new MemoryDatabase() });

/**
 * Provider chain that builds test AppContext.
 * Uses all fake implementations for deterministic tests.
 */
export const testAppProviders = Providers(
	FakeTimeServiceCtx,
	FakeIdServiceCtx,
	FrameworkClientCtx,
	TestStorageDatabaseCtx,
	provideFakeSkillSearchService
);

/**
 * Creates an AppContext for use in unit tests.
 * Always uses fake implementations, never external services.
 */
export async function TestAppContext(env: Record<string, unknown> = {}): Promise<AppContext> {
	// Parse to validate, though currently no strict requirements
	TestAppEnv(env);

	return (await testAppProviders()) as AppContext;
}
```

### 4.2 Update `package.json` test scripts

Find the test scripts and ensure `CONTEXT=test` is set:

```json
{
	"scripts": {
		"test:vitest": "CONTEXT=test vitest run",
		"test:vitest:watch": "CONTEXT=test vitest"
	}
}
```

Or if using cross-env (for Windows compatibility):

```json
{
	"scripts": {
		"test:vitest": "cross-env CONTEXT=test vitest run",
		"test:vitest:watch": "cross-env CONTEXT=test vitest"
	}
}
```

### 4.3 (Optional) Update `vitest.config.ts`

If the project has a custom Vitest config, add env defaults:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// ... other config
		env: {
			CONTEXT: 'test'
		}
	}
});
```

### 4.4 Add test to verify TestAppContext has skillSearchService

Create `src/lib/server/test-app-context.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { TestAppContext } from './test-app-context.js';
import { skillSearchService } from './services/skill-search/skill-search-service.js';
import { runInContext } from './util/provider/provider-ctx.js';

describe('TestAppContext', () => {
	it('includes fake skillSearchService', async () => {
		const ctx = await TestAppContext();

		await runInContext(ctx, async () => {
			const service = skillSearchService();
			expect(service).toBeDefined();
			expect(service.search).toBeInstanceOf(Function);
		});
	});

	it('skillSearchService returns deterministic results', async () => {
		const ctx = await TestAppContext();

		await runInContext(ctx, async () => {
			const service = skillSearchService();
			const results1 = await service.search({ query: 'JavaScript', limit: 10 });
			const results2 = await service.search({ query: 'JavaScript', limit: 10 });

			// Same query should return same results (deterministic)
			expect(results1).toEqual(results2);
		});
	});
});
```

### 4.5 Verify no CE calls in test suite

Add a test that would catch accidental real CE usage:

```typescript
// In credential-engine-skill-search-service.test.ts, add:
describe('Test environment safety', () => {
	it('does not make real HTTP calls by default', async () => {
		// Verify that TestAppContext uses fake, not real CE
		const ctx = await TestAppContext();

		await runInContext(ctx, async () => {
			const service = skillSearchService();
			const results = await service.search({ query: 'JavaScript', limit: 5 });

			// Fake service returns curated list, not CE results
			expect(results[0].uri).toMatch(/^https:\/\/example\.com/);
		});
	});
});
```

## Tests

All tests should pass:

- `test-app-context.test.ts` — Verify skillSearchService available
- All existing tests using `TestAppContext` — no regressions
- `fake-skill-search-service.test.ts` — Already passing from Phase 2

## Validate

```bash
pnpm check
CONTEXT=test pnpm test:vitest
```

Verify:

- TypeScript compiles
- Tests run with `CONTEXT=test`
- `TestAppContext` uses fake skill search
- No attempt to connect to CE in test run
- All existing tests still pass

## CI considerations

Ensure CI runs tests with correct context:

```yaml
# In .github/workflows/ci.yml or similar
- name: Run tests
  run: pnpm test:vitest
  env:
    CONTEXT: test
```

Or rely on the `package.json` script which already sets it.
