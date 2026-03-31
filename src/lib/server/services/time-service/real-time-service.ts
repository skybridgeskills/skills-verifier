import type { TimeService, TimeServiceCtx } from './time-service.js';

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
export type RealTimeService = ReturnType<typeof RealTimeService>;

export const RealTimeServiceCtx = () =>
	({ timeService: RealTimeService() }) satisfies TimeServiceCtx;
export type RealTimeServiceCtx = ReturnType<typeof RealTimeServiceCtx>;
