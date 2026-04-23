import type { AppContext } from '../app-context.js';
import { parseBaseEnv } from '../app-env.js';
import { buildVersionBody } from '../util/build-version-body.js';
import { providerCtxSafe } from '../util/provider/provider-ctx.js';

import type { HealthStatus } from './health-check.js';
import { healthRegistrySafe } from './provide-health-registry.js';
import type { ReadinessHttpResult, ReadinessResponse } from './readiness-response.js';

const processStartedAt = new Date();

function deploymentEnvironment(): string {
	try {
		return parseBaseEnv({ CONTEXT: process.env.CONTEXT } as Record<string, unknown>).CONTEXT;
	} catch {
		return 'unknown';
	}
}

function timestampIso() {
	const ctx = providerCtxSafe<AppContext>();
	const ms = ctx?.timeService?.dateNowMs();
	return new Date(ms ?? Date.now()).toISOString();
}

/**
 * Readiness body + HTTP status for `GET /health/ready` (OTel-style envelope).
 */
export async function buildReadinessResponse(): Promise<ReadinessHttpResult> {
	const version = buildVersionBody();
	const registry = healthRegistrySafe();

	if (!registry) {
		const body: ReadinessResponse = {
			status: 'DOWN',
			'service.name': 'skills-verifier',
			'service.version': version.version,
			'deployment.environment': deploymentEnvironment(),
			startupTime: processStartedAt.toISOString(),
			timestamp: timestampIso(),
			components: {
				registry: {
					status: 'DOWN',
					durationMs: 0,
					error: 'Health registry not initialized'
				}
			}
		};
		return { body, httpStatus: 503 };
	}

	const run = await registry.runAll();

	const components = Object.fromEntries(
		Object.entries(run.components).map(([name, c]) => [
			name,
			{
				status: c.status,
				durationMs: c.durationMs,
				...(c.error !== undefined ? { error: c.error } : {}),
				...(c.details !== undefined ? { details: c.details } : {})
			}
		])
	);

	const body: ReadinessResponse = {
		status: run.overall,
		'service.name': 'skills-verifier',
		'service.version': version.version,
		'deployment.environment': deploymentEnvironment(),
		startupTime: processStartedAt.toISOString(),
		timestamp: timestampIso(),
		components
	};

	return { body, httpStatus: httpStatusFor(run.overall) };
}

function httpStatusFor(overall: HealthStatus): 200 | 503 {
	return overall === 'DOWN' ? 503 : 200;
}
