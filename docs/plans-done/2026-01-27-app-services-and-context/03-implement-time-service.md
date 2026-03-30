# Phase 3: Implement Time Service

## Scope of Phase

Create the TimeService interface and both fake and real implementations. The time service provides time-related functionality with testable implementations.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### 1. Create `src/lib/server/services/time-service/time-service.ts`

Define the TimeService interface:

```typescript
/**
 * Service for determining the current time.
 *
 * Allows for tests to control business time without using fake timers, which is specific
 * to test frameworks but doesn't work in e2e tests and storybook.
 */
export interface TimeService {
	/**
	 * Returns the current instant as milliseconds for models and business purposes.
	 * In fake implementations, this returns stable values for deterministic tests.
	 */
	dateNowMs(): number;

	/**
	 * Returns the current time for performance calculations.
	 * All implementations should return the real time with as much precision as possible.
	 * This returns a high-precision relative timestamp (not relative to any epoch),
	 * suitable for performance measurements only.
	 */
	performanceNowMs(): number;
}
```

### 2. Create `src/lib/server/services/time-service/fake-time-service.ts`

Create the fake implementation with stable values:

```typescript
import type { TimeService } from './time-service.js';

let fakeDateNow = 1000000000000; // Start at a fixed timestamp
let callCount = 0;

/**
 * Fake implementation of TimeService for testing.
 * Returns stable, predictable values for deterministic tests.
 */
export function FakeTimeService(): TimeService {
	// Reset counters when creating a new instance (for test isolation)
	fakeDateNow = 1000000000000;
	callCount = 0;

	return {
		dateNowMs(): number {
			// Return stable value that increments slightly for each call
			// This allows testing ordering without being too predictable
			callCount++;
			return fakeDateNow + callCount;
		},
		performanceNowMs(): number {
			// Always return real performance.now() for accurate performance measurements
			return performance.now();
		}
	};
}
```

### 3. Create `src/lib/server/services/time-service/real-time-service.ts`

Create the real implementation:

```typescript
import type { TimeService } from './time-service.js';

/**
 * Real implementation of TimeService using Date.now() and performance.now().
 */
export function RealTimeService(): TimeService {
	return {
		dateNowMs(): number {
			return Date.now();
		},
		performanceNowMs(): number {
			return performance.now();
		}
	};
}
```

### 4. Create `src/lib/server/services/time-service/time-service.test.ts`

Write comprehensive tests:

```typescript
import { describe, it, expect } from 'vitest';
import { FakeTimeService } from './fake-time-service.js';
import { RealTimeService } from './real-time-service.js';

describe('TimeService', () => {
	describe('FakeTimeService', () => {
		it('returns stable dateNowMs values', () => {
			const service = FakeTimeService();
			const first = service.dateNowMs();
			const second = service.dateNowMs();

			expect(second).toBeGreaterThan(first);
			expect(first).toBeGreaterThan(1000000000000);
		});

		it('returns real performanceNowMs', () => {
			const service = FakeTimeService();
			const perf1 = service.performanceNowMs();
			const perf2 = service.performanceNowMs();

			expect(perf2).toBeGreaterThanOrEqual(perf1);
		});

		it('resets counters for new instances', () => {
			const service1 = FakeTimeService();
			const first1 = service1.dateNowMs();

			const service2 = FakeTimeService();
			const first2 = service2.dateNowMs();

			expect(first1).toBe(first2);
		});
	});

	describe('RealTimeService', () => {
		it('returns current dateNowMs', () => {
			const service = RealTimeService();
			const before = Date.now();
			const result = service.dateNowMs();
			const after = Date.now();

			expect(result).toBeGreaterThanOrEqual(before);
			expect(result).toBeLessThanOrEqual(after);
		});

		it('returns real performanceNowMs', () => {
			const service = RealTimeService();
			const perf1 = service.performanceNowMs();
			const perf2 = service.performanceNowMs();

			expect(perf2).toBeGreaterThanOrEqual(perf1);
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
- FakeTimeService returns stable values
- RealTimeService returns current time
- Both implementations return real performance.now()
