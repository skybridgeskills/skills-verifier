# Phase 4: Implement ID Service

## Scope of Phase

Create the IdService interface and both fake and real implementations. The ID service provides ID generation with different security levels and test string generation.

## Code Organization Reminders

- Prefer a granular file structure, one concept per file
- Place more abstract things, entry points, and tests **first**
- Place helper utility functions **at the bottom** of files
- Keep related functionality grouped together
- Any temporary code should have a TODO comment so we can find it later

## Implementation Details

### 1. Create `src/lib/server/services/id-service/id-service.ts`

Define the IdService interface:

```typescript
/**
 * Service for generating IDs and test strings.
 */
export interface IdService {
	/**
	 * Generates a string for testing with the given prefix.
	 * Useful for mock data. In tests, "name" would give "name-1", "name-2", etc.
	 * In production, this shouldn't be used often, but would likely give a time-based string.
	 */
	testStr(prefix: string): string;

	/**
	 * Generates a base-62 ID with 128 bits of entropy for cases where unguessability is needed.
	 * In tests, this uses testStr with "secure1", "secure2", etc.
	 */
	secureUid(): string;

	/**
	 * Generates a base-62 ID with 64 bits of entropy for unique but not unguessable use cases.
	 * In tests, this uses testStr with "unique1", "unique2", etc.
	 */
	uniqueUid(): string;
}
```

### 2. Create `src/lib/server/services/id-service/fake-id-service.ts`

Create the fake implementation with predictable IDs:

```typescript
import type { IdService } from './id-service.js';

// Counters per prefix for testStr
const testStrCounters = new Map<string, number>();

/**
 * Fake implementation of IdService for testing.
 * Returns predictable, deterministic IDs.
 */
export function FakeIdService(): IdService {
	// Reset counters when creating a new instance (for test isolation)
	testStrCounters.clear();

	return {
		testStr(prefix: string): string {
			const current = testStrCounters.get(prefix) ?? 0;
			const next = current + 1;
			testStrCounters.set(prefix, next);
			return `${prefix}-${next}`;
		},
		secureUid(): string {
			return this.testStr('secure');
		},
		uniqueUid(): string {
			return this.testStr('unique');
		}
	};
}
```

### 3. Create `src/lib/server/services/id-service/real-id-service.ts`

Create the real implementation using crypto:

```typescript
import type { IdService } from './id-service.js';
import { bytesToBigInt } from '../../util/number/bytes-to-big-int.js';
import { toBase62 } from '../../util/number/to-base62.js';

/**
 * Generates secure random bytes using crypto.getRandomValues.
 */
function secureRandomBytes(count: number): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(count));
}

/**
 * Generates a base-62 ID with the given bits of entropy.
 */
function generateBase62Uid(bitsOfEntropy: number): string {
	// Get random bytes
	const bytes = secureRandomBytes(Math.ceil(bitsOfEntropy / 8));

	// Convert the bytes to a big number (working in base 256)
	const num = bytesToBigInt(bytes);

	// Calculate the required length to represent bitsOfEntropy in our base
	// log_base(2^bitsOfEntropy) = bitsOfEntropy * log_base(2)
	const requiredLength = Math.ceil((bitsOfEntropy * Math.log(2)) / Math.log(62));

	return toBase62(num, requiredLength);
}

/**
 * Real implementation of IdService using crypto for secure ID generation.
 */
export function RealIdService(): IdService {
	let testStrCounter = 0;

	return {
		testStr(prefix: string): string {
			// In production, use time-based string (not commonly used)
			testStrCounter++;
			return `${prefix}-${Date.now()}-${testStrCounter}`;
		},
		secureUid(): string {
			// 128 bits of entropy for unguessable IDs
			return generateBase62Uid(128);
		},
		uniqueUid(): string {
			// 64 bits of entropy for unique but guessable IDs
			return generateBase62Uid(64);
		}
	};
}
```

### 4. Create `src/lib/server/services/id-service/id-service.test.ts`

Write comprehensive tests:

```typescript
import { describe, it, expect } from 'vitest';
import { FakeIdService } from './fake-id-service.js';
import { RealIdService } from './real-id-service.js';

describe('IdService', () => {
	describe('FakeIdService', () => {
		it('generates test strings with incrementing counters', () => {
			const service = FakeIdService();

			expect(service.testStr('name')).toBe('name-1');
			expect(service.testStr('name')).toBe('name-2');
			expect(service.testStr('other')).toBe('other-1');
			expect(service.testStr('other')).toBe('other-2');
		});

		it('generates secureUid using testStr', () => {
			const service = FakeIdService();

			expect(service.secureUid()).toBe('secure-1');
			expect(service.secureUid()).toBe('secure-2');
		});

		it('generates uniqueUid using testStr', () => {
			const service = FakeIdService();

			expect(service.uniqueUid()).toBe('unique-1');
			expect(service.uniqueUid()).toBe('unique-2');
		});

		it('resets counters for new instances', () => {
			const service1 = FakeIdService();
			service1.testStr('test');

			const service2 = FakeIdService();
			expect(service2.testStr('test')).toBe('test-1');
		});
	});

	describe('RealIdService', () => {
		it('generates unique secureUid values', () => {
			const service = RealIdService();
			const id1 = service.secureUid();
			const id2 = service.secureUid();

			expect(id1).not.toBe(id2);
			expect(id1.length).toBeGreaterThan(0);
			expect(id2.length).toBeGreaterThan(0);
		});

		it('generates unique uniqueUid values', () => {
			const service = RealIdService();
			const id1 = service.uniqueUid();
			const id2 = service.uniqueUid();

			expect(id1).not.toBe(id2);
			expect(id1.length).toBeGreaterThan(0);
			expect(id2.length).toBeGreaterThan(0);
		});

		it('generates test strings', () => {
			const service = RealIdService();
			const str = service.testStr('test');

			expect(str).toMatch(/^test-\d+-\d+$/);
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
- FakeIdService returns predictable IDs
- RealIdService generates unique IDs
- Base62 encoding produces valid base-62 strings
