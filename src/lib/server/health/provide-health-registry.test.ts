import { describe, expect, it } from 'vitest';

import { HealthCheck, HealthCheckSym } from './health-check.js';
import { provideHealthRegistry } from './provide-health-registry.js';

describe('provideHealthRegistry', () => {
	it('discovers checks from top-level context values via HealthCheckSym', () => {
		const dbCheck = HealthCheck({ name: 'dynamodb', check: async () => ({ status: 'UP' }) });
		const ceCheck = HealthCheck({
			name: 'credential-engine',
			check: async () => ({ status: 'UP' })
		});

		const ctx = {
			db: { table: 'jobs', [HealthCheckSym]: dbCheck },
			skillSearchService: { search() {}, [HealthCheckSym]: ceCheck }
		};

		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(2);
	});

	it('skips values that do not carry the symbol', () => {
		const ctx = {
			logger: { info() {} },
			timeService: { dateNowMs: () => 0, performanceNowMs: () => 0 },
			database: {
				table: 'jobs',
				[HealthCheckSym]: HealthCheck({ name: 'dynamodb', check: async () => ({ status: 'UP' }) })
			}
		};

		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(1);
	});

	it('handles primitive and nullish context values without throwing', () => {
		const ctx = {
			n: 42,
			s: 'foo',
			empty: null,
			undef: undefined,
			withCheck: {
				[HealthCheckSym]: HealthCheck({ name: 'x', check: async () => ({ status: 'UP' }) })
			}
		};

		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(1);
	});

	it('builds an empty registry when no values carry the symbol', () => {
		const ctx = { logger: {}, database: {}, skillSearchService: {} };
		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(0);
	});

	it('does NOT recurse into nested objects', () => {
		const nested = HealthCheck({ name: 'nested', check: async () => ({ status: 'UP' }) });
		const ctx = {
			services: { inner: { [HealthCheckSym]: nested } }
		};
		const { healthRegistry } = provideHealthRegistry(ctx);
		expect(healthRegistry.size()).toBe(0);
	});
});
