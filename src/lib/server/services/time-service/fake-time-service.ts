import { logServiceInitialized } from '../../util/log-service-initialized.js';

import type { TimeService, TimeServiceCtx } from './time-service.js';

/**
 * Fake implementation of TimeService for testing.
 * Returns stable, predictable values for deterministic tests.
 */
export function FakeTimeService(): TimeService {
	// Reset counters when creating a new instance (for test isolation)
	const fakeDateNow = new Date('2020-01-01T00:00:00Z').getTime();
	let callCount = 0;

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
export type FakeTimeService = ReturnType<typeof FakeTimeService>;

export const FakeTimeServiceCtx = () => {
	const slice = { timeService: FakeTimeService() } satisfies TimeServiceCtx;
	logServiceInitialized('timeService', 'fake');
	return slice;
};
export type FakeTimeServiceCtx = ReturnType<typeof FakeTimeServiceCtx>;
