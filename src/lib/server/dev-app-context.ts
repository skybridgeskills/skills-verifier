import {
	provideFakeFrameworkClient,
	provideHttpFrameworkClient
} from '$lib/clients/framework-client/framework-client.js';

import type { AppContext } from './app-context.js';
import { StorageDatabaseCtx } from './core/storage/storage-database-ctx.js';
import { provideFakeVerificationExchange } from './domain/verification/provide-fake-verification-exchange.js';
import { provideHttpVerificationExchange } from './domain/verification/provide-http-verification-exchange.js';
import { readVerificationConfig } from './domain/verification/verification-config.js';
import { provideHealthLogging } from './health/provide-health-logging.js';
import { provideHealthRegistry } from './health/provide-health-registry.js';
import { provideAuthService } from './services/auth/provide-auth-service.js';
import { RealIdServiceCtx } from './services/id-service/real-id-service.js';
import { RealLoggerServiceCtx } from './services/logging/real-logger-service.js';
import { provideCredentialEngineSkillSearchService } from './services/skill-search/credential-engine/provide-credential-engine-skill-search-service.js';
import { provideFakeSkillSearchService } from './services/skill-search/provide-fake-skill-search-service.js';
import { RealTimeServiceCtx } from './services/time-service/real-time-service.js';
import { Providers } from './util/provider/providers.js';

function devCredentialEngineConfig(env: Record<string, unknown>): {
	useReal: boolean;
	searchUrl: string;
	apiKey: string;
} {
	const url =
		typeof env.CREDENTIAL_ENGINE_SEARCH_URL === 'string'
			? env.CREDENTIAL_ENGINE_SEARCH_URL.trim()
			: '';
	const apiKey =
		typeof env.CREDENTIAL_ENGINE_API_KEY === 'string' ? env.CREDENTIAL_ENGINE_API_KEY.trim() : '';
	const useReal = url.length > 0 && apiKey.length > 0;
	return { useReal, searchUrl: url, apiKey };
}

/**
 * Admin auth config for dev. Falls back to insecure defaults when unset so the
 * app still boots offline; override `ADMIN_PASSWORD` / `AUTH_SECRET` for real use.
 */
function devAuthConfig(env: Record<string, unknown>): {
	adminPassword: string;
	authSecret: string;
} {
	const adminPassword =
		typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length > 0
			? env.ADMIN_PASSWORD
			: 'dev';
	const authSecret =
		typeof env.AUTH_SECRET === 'string' && env.AUTH_SECRET.length > 0
			? env.AUTH_SECRET
			: 'dev-insecure-secret';
	return { adminPassword, authSecret };
}

/**
 * Creates an AppContext for local development (`CONTEXT=dev`).
 * Framework client and skill search use real CE when both `CREDENTIAL_ENGINE_*` vars are set;
 * otherwise fake (for offline development, Storybook, etc.).
 */
export async function DevAppContext(env: Record<string, unknown>): Promise<AppContext> {
	const ce = devCredentialEngineConfig(env);
	const auth = devAuthConfig(env);
	const verificationConfig = readVerificationConfig(env);
	const verificationUseReal = verificationConfig.url.length > 0;
	const logLevel =
		typeof env.LOG_LEVEL === 'string' && env.LOG_LEVEL.trim().length > 0
			? env.LOG_LEVEL.trim()
			: 'info';

	return (await Providers(
		RealLoggerServiceCtx({ level: logLevel, pretty: true }),
		RealTimeServiceCtx,
		RealIdServiceCtx,
		() => provideAuthService(auth),
		ce.useReal ? provideHttpFrameworkClient : provideFakeFrameworkClient,
		StorageDatabaseCtx(env),
		ce.useReal
			? () =>
					provideCredentialEngineSkillSearchService({
						searchUrl: ce.searchUrl,
						apiKey: ce.apiKey
					})
			: provideFakeSkillSearchService,
		verificationUseReal
			? () => provideHttpVerificationExchange(verificationConfig)
			: provideFakeVerificationExchange,
		provideHealthRegistry,
		provideHealthLogging
	)()) as AppContext;
}
