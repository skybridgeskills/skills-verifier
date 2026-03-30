# Phase 6: Create App Context Factories

## Scope of Phase

Create factory functions for creating AppContext instances with fake and real service implementations. These factories will be used in tests and production code.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### 1. Create `src/lib/server/fake-app-context.ts`

Create the fake app context factory:

```typescript
import type { AppContext } from './app-context.js';
import { FakeTimeService } from './services/time-service/fake-time-service.js';
import { FakeIdService } from './services/id-service/fake-id-service.js';
import { createFrameworkService } from './clients/framework-client/framework-client.js';

/**
 * Creates a fake AppContext with fake service implementations for testing.
 */
export function FakeAppContext(): AppContext {
	return {
		timeService: FakeTimeService(),
		idService: FakeIdService(),
		frameworkClient: createFrameworkService()
	} satisfies AppContext;
}
```

### 2. Create `src/lib/server/real-app-context.ts`

Create the real app context factory:

```typescript
import type { AppContext } from './app-context.js';
import { RealTimeService } from './services/time-service/real-time-service.js';
import { RealIdService } from './services/id-service/real-id-service.js';
import { createFrameworkService } from './clients/framework-client/framework-client.js';

/**
 * Creates a real AppContext with real service implementations for production use.
 */
export function RealAppContext(): AppContext {
	return {
		timeService: RealTimeService(),
		idService: RealIdService(),
		frameworkClient: createFrameworkService()
	} satisfies AppContext;
}
```

### 3. Create `src/lib/server/fake-app-context.test.ts`

Write tests for the fake app context:

```typescript
import { describe, it, expect } from 'vitest';
import { FakeAppContext } from './fake-app-context.js';
import { runInContext, appContext } from './app-context.js';

describe('FakeAppContext', () => {
	it('creates an AppContext with fake services', () => {
		const context = FakeAppContext();

		expect(context.timeService).toBeDefined();
		expect(context.idService).toBeDefined();
		expect(context.frameworkClient).toBeDefined();
	});

	it('returns stable dateNowMs values', () => {
		const context = FakeAppContext();

		runInContext(context, () => {
			const ctx = appContext();
			const first = ctx.timeService.dateNowMs();
			const second = ctx.timeService.dateNowMs();

			expect(second).toBeGreaterThan(first);
		});
	});

	it('generates predictable IDs', () => {
		const context = FakeAppContext();

		runInContext(context, () => {
			const ctx = appContext();

			expect(ctx.idService.testStr('test')).toBe('test-1');
			expect(ctx.idService.testStr('test')).toBe('test-2');
			expect(ctx.idService.secureUid()).toBe('secure-1');
			expect(ctx.idService.uniqueUid()).toBe('unique-1');
		});
	});
});
```

### 4. Create `src/lib/server/real-app-context.test.ts`

Write tests for the real app context:

```typescript
import { describe, it, expect } from 'vitest';
import { RealAppContext } from './real-app-context.js';
import { runInContext, appContext } from './app-context.js';

describe('RealAppContext', () => {
	it('creates an AppContext with real services', () => {
		const context = RealAppContext();

		expect(context.timeService).toBeDefined();
		expect(context.idService).toBeDefined();
		expect(context.frameworkClient).toBeDefined();
	});

	it('returns current dateNowMs', () => {
		const context = RealAppContext();

		runInContext(context, () => {
			const ctx = appContext();
			const before = Date.now();
			const result = ctx.timeService.dateNowMs();
			const after = Date.now();

			expect(result).toBeGreaterThanOrEqual(before);
			expect(result).toBeLessThanOrEqual(after);
		});
	});

	it('generates unique IDs', () => {
		const context = RealAppContext();

		runInContext(context, () => {
			const ctx = appContext();

			const id1 = ctx.idService.secureUid();
			const id2 = ctx.idService.secureUid();

			expect(id1).not.toBe(id2);
			expect(id1.length).toBeGreaterThan(0);
			expect(id2.length).toBeGreaterThan(0);
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
- FakeAppContext creates context with fake services
- RealAppContext creates context with real services
- Services work correctly when accessed through context
