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
