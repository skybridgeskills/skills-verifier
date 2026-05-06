import { afterEach, describe, expect, it, vi } from 'vitest';

import { FakeLoggerService } from '../services/logging/fake-logger-service.js';
import { readFakeLoggerRecords } from '../services/logging/logger-service.js';

import type { HealthRegistry } from './health-registry.js';
import { provideHealthLogging } from './provide-health-logging.js';

describe('provideHealthLogging', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('periodically logs registry snapshots and returns a Symbol.dispose stopper', async () => {
		vi.useFakeTimers();

		const logger = FakeLoggerService();
		const runAll = vi.fn().mockResolvedValue({
			overall: 'UP',
			runAtMs: 1_776_720_000_000,
			components: {
				dynamodb: { status: 'UP', durationMs: 5 }
			}
		});

		const provider = provideHealthLogging(
			{
				logger,
				healthRegistry: { runAll } as unknown as HealthRegistry
			},
			{
				initialDelayMs: 10,
				intervalMs: 1_000,
				env: {
					APP_NAME: 'skills-verifier',
					ENV_NAME: 'staging',
					SKILLS_VERIFIER_VERSION: '2026.05.06-1',
					SERVICE_INSTANCE_ID: 'test-instance'
				}
			}
		);

		expect(provider[Symbol.dispose]).toEqual(expect.any(Function));
		expect(runAll).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(10);

		expect(runAll).toHaveBeenCalledTimes(1);
		expect(readFakeLoggerRecords(logger)).toContainEqual(
			expect.objectContaining({
				level: 'info',
				msg: 'health-snapshot',
				data: expect.objectContaining({
					event: 'health-snapshot',
					service_name: 'skills-verifier',
					service_version: '2026.05.06-1',
					deployment_environment: 'staging',
					service_instance_id: 'test-instance',
					status: 'UP',
					readiness: true,
					componentCount: 1,
					intervalMs: 1_000
				})
			})
		);

		provider[Symbol.dispose]();
		await vi.advanceTimersByTimeAsync(1_000);

		expect(runAll).toHaveBeenCalledTimes(1);
	});

	it('does not schedule when disabled by env', async () => {
		vi.useFakeTimers();

		const runAll = vi.fn();
		const provider = provideHealthLogging(
			{
				logger: FakeLoggerService(),
				healthRegistry: { runAll } as unknown as HealthRegistry
			},
			{
				env: { HEALTH_SNAPSHOT_ENABLED: 'false' }
			}
		);

		await vi.advanceTimersByTimeAsync(60_000);
		provider[Symbol.dispose]();

		expect(runAll).not.toHaveBeenCalled();
	});
});
