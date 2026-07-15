import { appContext } from '$lib/server/app-context.js';

import { logServiceInitialized } from '../../util/log-service-initialized.js';

import { AuthService, SESSION_TTL_MS, type AuthServiceCtx } from './auth-service.js';

export interface AuthProviderConfig {
	adminPassword: string;
	authSecret: string;
}

/**
 * Provides the admin `AuthService` from resolved config. Uses the context
 * `timeService` for the clock so tests (fake time) stay deterministic.
 */
export function provideAuthService(config: AuthProviderConfig): AuthServiceCtx {
	const authService = AuthService({
		adminPassword: config.adminPassword,
		authSecret: config.authSecret,
		sessionTtlMs: SESSION_TTL_MS,
		nowMs: () => appContext().timeService.dateNowMs()
	});
	logServiceInitialized('authService', 'real');
	return { authService };
}

/**
 * Test provider with a fixed password + secret so `test`-context code can
 * exercise auth deterministically.
 */
export function provideTestAuthService(): AuthServiceCtx {
	const authService = AuthService({
		adminPassword: 'test-password',
		authSecret: 'test-insecure-secret',
		sessionTtlMs: SESSION_TTL_MS,
		nowMs: () => appContext().timeService.dateNowMs()
	});
	logServiceInitialized('authService', 'test');
	return { authService };
}
