import { describe, expect, it } from 'vitest';

import { runInContext } from '../util/provider/provider-ctx.js';

import { handleReadinessGet } from './handle-readiness-get.js';
import type { HealthRegistry } from './health-registry.js';

const startupTime = new Date('2026-04-22T10:00:00.000Z');

function ctx(reg: HealthRegistry) {
	return {
		healthRegistry: reg,
		timeService: {
			dateNowMs: () => startupTime.getTime(),
			performanceNowMs: () => 0
		}
	};
}

describe('handleReadinessGet', () => {
	it('returns 200 when overall is UP', async () => {
		const reg: HealthRegistry = {
			register: () => {},
			size: () => 0,
			runAll: async () => ({ overall: 'UP', components: {}, runAtMs: 0 })
		};

		const res = await runInContext(ctx(reg), () => handleReadinessGet());
		expect(res.status).toBe(200);
		const body: { status: string } = await res.json();
		expect(body.status).toBe('UP');
	});

	it('returns 503 when overall is DOWN', async () => {
		const reg: HealthRegistry = {
			register: () => {},
			size: () => 1,
			runAll: async () => ({
				overall: 'DOWN',
				components: { 'credential-engine': { status: 'DOWN', durationMs: 4, error: 'timeout' } },
				runAtMs: 0
			})
		};

		const res = await runInContext(ctx(reg), () => handleReadinessGet());
		expect(res.status).toBe(503);
		const body: { status: string; components: { 'credential-engine': { error: string } } } =
			await res.json();
		expect(body.status).toBe('DOWN');
		expect(body.components['credential-engine'].error).toBe('timeout');
	});

	it('returns 200 on DEGRADED (not 503)', async () => {
		const reg: HealthRegistry = {
			register: () => {},
			size: () => 1,
			runAll: async () => ({
				overall: 'DEGRADED',
				components: { 'credential-engine': { status: 'DEGRADED', durationMs: 10, error: 'slow' } },
				runAtMs: 0
			})
		};

		const res = await runInContext(ctx(reg), () => handleReadinessGet());
		expect(res.status).toBe(200);
		const body: { status: string } = await res.json();
		expect(body.status).toBe('DEGRADED');
	});
});
