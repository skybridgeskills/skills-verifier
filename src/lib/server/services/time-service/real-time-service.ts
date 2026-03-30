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
