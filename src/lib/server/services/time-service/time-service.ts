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

export type TimeServiceCtx = {
	timeService: TimeService;
};
