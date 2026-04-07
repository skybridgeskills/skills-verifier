import { appLoggerSafe } from '$lib/server/services/logging/logger-service.js';

import { getAppVersion } from './app-version.js';

/**
 * Log a service binding at startup when the provider runs inside AppContext (ALS has a logger).
 * No-ops when no logger is present (e.g. unit tests that call a provider without full context).
 */
export function logServiceInitialized(
	service: string,
	implementation: string,
	extra?: Record<string, unknown>
): void {
	const log = appLoggerSafe();
	if (log === undefined) return;

	log.info(
		{ appVersion: getAppVersion(), service, implementation, ...extra },
		'service initialized'
	);
}
