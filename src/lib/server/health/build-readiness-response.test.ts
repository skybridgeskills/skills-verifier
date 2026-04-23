import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { runInContext } from '../util/provider/provider-ctx.js';

import { buildReadinessResponse } from './build-readiness-response.js';
import type { HealthRegistry, RegistryRunResult } from './health-registry.js';

const fixedNow = new Date('2026-04-22T10:05:00.000Z');

function fakeRegistry(result: RegistryRunResult): HealthRegistry {
	return {
		register: () => {},
		size: () => Object.keys(result.components).length,
		runAll: async () => result
	};
}

const baseCtx = (registry: HealthRegistry) => ({
	healthRegistry: registry,
	timeService: {
		dateNowMs: () => fixedNow.getTime(),
		performanceNowMs: () => 0
	}
});

describe('buildReadinessResponse', () => {
	const prevContext = process.env.CONTEXT;

	beforeEach(() => {
		process.env.CONTEXT = 'aws';
	});

	afterEach(() => {
		process.env.CONTEXT = prevContext;
	});

	it('returns the OTel envelope + components map for an all-UP system, status 200', async () => {
		const reg = fakeRegistry({
			overall: 'UP',
			runAtMs: fixedNow.getTime(),
			components: {
				dynamodb: { status: 'UP', durationMs: 4 },
				'credential-engine': { status: 'UP', durationMs: 2 }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());

		expect(r.httpStatus).toBe(200);
		expect(r.body.status).toBe('UP');
		expect(r.body['service.name']).toBe('skills-verifier');
		expect(r.body['service.version'].length).toBeGreaterThan(0);
		expect(r.body['deployment.environment']).toBe('aws');
		expect(r.body.timestamp).toBe(fixedNow.toISOString());
		expect(r.body.startupTime).toBeDefined();
		expect(r.body.components).toEqual({
			dynamodb: { status: 'UP', durationMs: 4 },
			'credential-engine': { status: 'UP', durationMs: 2 }
		});
	});

	it('keeps httpStatus 200 on overall DEGRADED', async () => {
		const reg = fakeRegistry({
			overall: 'DEGRADED',
			runAtMs: fixedNow.getTime(),
			components: {
				'credential-engine': { status: 'DEGRADED', durationMs: 10, error: 'HTTP 404' }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(r.body.status).toBe('DEGRADED');
		expect(r.httpStatus).toBe(200);
		expect(r.body.components['credential-engine']?.error).toBe('HTTP 404');
	});

	it('returns httpStatus 503 on overall DOWN', async () => {
		const reg = fakeRegistry({
			overall: 'DOWN',
			runAtMs: fixedNow.getTime(),
			components: {
				dynamodb: { status: 'DOWN', durationMs: 7, error: 'connection refused' }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(r.httpStatus).toBe(503);
		expect(r.body.status).toBe('DOWN');
	});

	it('omits error/details fields when the check did not provide them', async () => {
		const reg = fakeRegistry({
			overall: 'UP',
			runAtMs: fixedNow.getTime(),
			components: {
				dynamodb: { status: 'UP', durationMs: 4 }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(Object.keys(r.body.components.dynamodb ?? {}).sort()).toEqual(
			['durationMs', 'status'].sort()
		);
	});

	it('passes through details when the check provides them', async () => {
		const reg = fakeRegistry({
			overall: 'UP',
			runAtMs: fixedNow.getTime(),
			components: {
				dynamodb: { status: 'UP', durationMs: 12, details: { tableName: 'jobs' } }
			}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(r.body.components.dynamodb?.details).toEqual({ tableName: 'jobs' });
	});

	it('returns UP with empty components when no checks are registered', async () => {
		const reg = fakeRegistry({
			overall: 'UP',
			runAtMs: fixedNow.getTime(),
			components: {}
		});
		const r = await runInContext(baseCtx(reg), () => buildReadinessResponse());
		expect(r.httpStatus).toBe(200);
		expect(r.body.components).toEqual({});
	});

	it('returns DOWN with error when registry is not in context', async () => {
		const r = await runInContext({}, () => buildReadinessResponse());
		expect(r.httpStatus).toBe(503);
		expect(r.body.status).toBe('DOWN');
		expect(r.body.components.registry?.error).toBe('Health registry not initialized');
	});
});
