import { describe, expect, it } from 'vitest';

import { HealthCheck, HealthCheckSym } from './health-check.js';

describe('HealthCheckSym', () => {
	it('is a unique symbol with a descriptive label', () => {
		expect(typeof HealthCheckSym).toBe('symbol');
		expect(HealthCheckSym.toString()).toContain('healthCheck');
	});
});

describe('HealthCheck factory', () => {
	it('passes through name + check + optional timeoutMs', () => {
		const check = async () => ({ status: 'UP' as const });
		const h = HealthCheck({ name: 'dynamodb', check, timeoutMs: 1500 });
		expect(h.name).toBe('dynamodb');
		expect(h.check).toBe(check);
		expect(h.timeoutMs).toBe(1500);
	});

	it('preserves a missing timeoutMs as undefined (registry will default)', () => {
		const h = HealthCheck({ name: 'ce', check: async () => ({ status: 'UP' }) });
		expect(h.timeoutMs).toBeUndefined();
	});
});
