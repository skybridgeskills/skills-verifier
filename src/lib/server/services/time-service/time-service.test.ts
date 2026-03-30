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
