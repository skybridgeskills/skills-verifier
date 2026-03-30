# Phase 5: Create App Context System

## Scope of Phase

Create the AppContext interface and context access functions (appContext, runInContext, runWithExtraContext). This provides the foundation for accessing services via async local storage.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### 1. Create `src/lib/server/app-context.ts`

Create the AppContext interface and context access functions:

```typescript
import type { FrameworkClient } from '../server/clients/framework-client/framework-client.js';
import type { TimeService } from './services/time-service/time-service.js';
import type { IdService } from './services/id-service/id-service.js';
import { createGlobalSingleton, getGlobalSingleton } from './util/global-singleton.js';
import { UniversalAsyncLocalStore } from './util/async-local-storage/universal-async-local-store.js';
import { panic } from './util/panic.js';

/**
 * Application context containing all services.
 */
export interface AppContext {
	timeService: TimeService;
	idService: IdService;
	frameworkClient: FrameworkClient;
}

const CONTEXT_STORE_KEY = '__appContextStore';

/**
 * Gets the singleton contextStore instance from the global cache.
 */
function getContextStoreSync() {
	return getGlobalSingleton<Awaited<ReturnType<typeof UniversalAsyncLocalStore<AppContext>>>>(
		CONTEXT_STORE_KEY
	);
}

/**
 * The main storage for the app context.
 * This is a singleton that's shared across all module instances.
 */
export const contextStore = await createGlobalSingleton(CONTEXT_STORE_KEY, () =>
	UniversalAsyncLocalStore<AppContext>()
);

/**
 * Gets the current AppContext from async local storage.
 * Throws an error if no context is present.
 */
export function appContext(): AppContext {
	const store = getContextStoreSync();
	const context = store.getStore();

	if (!context) {
		panic('No app context present. Ensure runInContext() is called before accessing appContext().');
	}

	return context;
}

/**
 * Runs a function with the given AppContext.
 * The context is available via appContext() within the function.
 */
export function runInContext<T>(context: AppContext, fn: () => T): T {
	const store = getContextStoreSync();
	if (context === store.getStore()) {
		return fn();
	} else {
		return store.run({ ...context }, fn);
	}
}

/**
 * Extends the current context with additional properties and runs a function in it.
 * Merges the extra properties with the existing context.
 */
export function runWithExtraContext<T>(extra: Partial<AppContext>, fn: () => T): T {
	const store = getContextStoreSync();
	const current = store.getStore();

	return store.run(
		{
			...(current ?? {}),
			...extra
		} as AppContext,
		fn
	);
}
```

### 2. Create `src/lib/server/app-context.test.ts`

Write comprehensive tests:

```typescript
import { describe, it, expect } from 'vitest';
import { appContext, runInContext, runWithExtraContext } from './app-context.js';
import { FakeTimeService } from './services/time-service/fake-time-service.js';
import { FakeIdService } from './services/id-service/fake-id-service.js';
import { FakeFrameworkClient } from './clients/framework-client/fake-framework-client.js';
import type { AppContext } from './app-context.js';

describe('app-context', () => {
	function createTestContext(): AppContext {
		return {
			timeService: FakeTimeService(),
			idService: FakeIdService(),
			frameworkClient: new FakeFrameworkClient()
		};
	}

	describe('runInContext', () => {
		it('makes context available via appContext()', () => {
			const context = createTestContext();

			runInContext(context, () => {
				const ctx = appContext();
				expect(ctx).toBeDefined();
				expect(ctx.timeService).toBe(context.timeService);
				expect(ctx.idService).toBe(context.idService);
				expect(ctx.frameworkClient).toBe(context.frameworkClient);
			});
		});

		it('throws if appContext() called outside of runInContext', () => {
			expect(() => {
				appContext();
			}).toThrow('No app context present');
		});

		it('returns the result of the function', () => {
			const context = createTestContext();
			const result = runInContext(context, () => {
				return 42;
			});

			expect(result).toBe(42);
		});

		it('handles nested contexts', () => {
			const context1 = createTestContext();
			const context2 = createTestContext();

			runInContext(context1, () => {
				const ctx1 = appContext();

				runInContext(context2, () => {
					const ctx2 = appContext();
					expect(ctx2).toBe(context2);
				});

				const ctx1Again = appContext();
				expect(ctx1Again).toBe(context1);
			});
		});
	});

	describe('runWithExtraContext', () => {
		it('extends existing context', () => {
			const baseContext = createTestContext();
			const newTimeService = FakeTimeService();

			runInContext(baseContext, () => {
				runWithExtraContext({ timeService: newTimeService }, () => {
					const ctx = appContext();
					expect(ctx.timeService).toBe(newTimeService);
					expect(ctx.idService).toBe(baseContext.idService);
					expect(ctx.frameworkClient).toBe(baseContext.frameworkClient);
				});
			});
		});

		it('creates new context if none exists', () => {
			const newTimeService = FakeTimeService();
			const newIdService = FakeIdService();

			runWithExtraContext(
				{
					timeService: newTimeService,
					idService: newIdService
				},
				() => {
					const ctx = appContext();
					expect(ctx.timeService).toBe(newTimeService);
					expect(ctx.idService).toBe(newIdService);
				}
			);
		});
	});
});
```

## Validate

Run the following command to ensure everything compiles and tests pass:

```bash
turbo check test
```

Verify that:

- All files compile without TypeScript errors
- All tests pass
- No linting errors
- Context is accessible within runInContext
- Context throws error when accessed outside runInContext
- runWithExtraContext properly extends context
