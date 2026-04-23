import { describe, expect, it, vi } from 'vitest';

import { HealthCheck } from './health-check.js';
import { HealthRegistry } from './health-registry.js';

describe('HealthRegistry', () => {
	it('runs all registered checks and aggregates UP when everything is UP', async () => {
		const reg = HealthRegistry();
		reg.register(HealthCheck({ name: 'a', check: async () => ({ status: 'UP' }) }));
		reg.register(HealthCheck({ name: 'b', check: async () => ({ status: 'UP' }) }));

		const r = await reg.runAll();
		expect(r.overall).toBe('UP');
		expect(Object.keys(r.components).sort()).toEqual(['a', 'b']);
		expect(r.components.a?.status).toBe('UP');
	});

	it('aggregates DOWN if any check is DOWN, DEGRADED if any is DEGRADED otherwise', async () => {
		const reg = HealthRegistry();
		reg.register(HealthCheck({ name: 'ok', check: async () => ({ status: 'UP' }) }));
		reg.register(
			HealthCheck({ name: 'slow', check: async () => ({ status: 'DEGRADED', error: 'slow' }) })
		);
		reg.register(
			HealthCheck({ name: 'bad', check: async () => ({ status: 'DOWN', error: 'broke' }) })
		);

		const r = await reg.runAll();
		expect(r.overall).toBe('DOWN');
		expect(r.components.bad?.error).toBe('broke');
	});

	it('reports a hung check as DOWN with error "timeout"', async () => {
		const reg = HealthRegistry({ defaultTimeoutMs: 20 });
		reg.register(
			HealthCheck({
				name: 'hangs',
				check: () => new Promise(() => {}) // never resolves
			})
		);

		const r = await reg.runAll();
		expect(r.components.hangs?.status).toBe('DOWN');
		expect(r.components.hangs?.error).toBe('timeout');
	});

	it('captures a thrown error from a check as DOWN with the message', async () => {
		const reg = HealthRegistry();
		reg.register(
			HealthCheck({
				name: 'throws',
				check: async () => {
					throw new Error('boom');
				}
			})
		);

		const r = await reg.runAll();
		expect(r.components.throws?.status).toBe('DOWN');
		expect(r.components.throws?.error).toBe('boom');
	});

	it('caches the aggregated result for the configured TTL', async () => {
		const reg = HealthRegistry({ cacheTtlMs: 60_000 });
		const check = vi.fn(async () => ({ status: 'UP' as const }));
		reg.register(HealthCheck({ name: 'cached', check }));

		await reg.runAll();
		await reg.runAll();
		await reg.runAll();
		expect(check).toHaveBeenCalledTimes(1);
	});

	it('shares a single in-flight runAll across concurrent callers', async () => {
		const reg = HealthRegistry();
		const check = vi.fn(
			() =>
				new Promise<{ status: 'UP' }>((resolve) => {
					setTimeout(() => resolve({ status: 'UP' }), 5);
				})
		);
		reg.register(HealthCheck({ name: 'single', check }));

		const [a, b, c] = await Promise.all([reg.runAll(), reg.runAll(), reg.runAll()]);
		expect(check).toHaveBeenCalledTimes(1);
		expect(a).toBe(b);
		expect(b).toBe(c);
	});

	it('returns UP with empty components when no checks are registered', async () => {
		const reg = HealthRegistry();
		const r = await reg.runAll();
		expect(r.overall).toBe('UP');
		expect(r.components).toEqual({});
	});

	it('respects per-check timeoutMs overrides', async () => {
		const reg = HealthRegistry({ defaultTimeoutMs: 10_000 });
		reg.register(
			HealthCheck({
				name: 'fast-timeout',
				timeoutMs: 20,
				check: () => new Promise(() => {})
			})
		);
		const r = await reg.runAll();
		expect(r.components['fast-timeout']?.status).toBe('DOWN');
		expect(r.components['fast-timeout']?.error).toBe('timeout');
	});
});
