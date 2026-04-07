import {
	provideFakeFrameworkClient,
	provideHttpFrameworkClient
} from '$lib/clients/framework-client/framework-client.js';

import type { AppContext } from './app-context.js';
import { StorageDatabaseCtx } from './core/storage/storage-database-ctx.js';
import { RealIdServiceCtx } from './services/id-service/real-id-service.js';
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
 * Creates an AppContext for local development (`CONTEXT=dev`).
 * Framework client and skill search use real CE when both `CREDENTIAL_ENGINE_*` vars are set;
 * otherwise fake (for offline development, Storybook, etc.).
 */
export async function DevAppContext(env: Record<string, unknown>): Promise<AppContext> {
	const ce = devCredentialEngineConfig(env);

	return (await Providers(
		RealTimeServiceCtx,
		RealIdServiceCtx,
		ce.useReal ? provideHttpFrameworkClient : provideFakeFrameworkClient,
		StorageDatabaseCtx,
		ce.useReal
			? () =>
					provideCredentialEngineSkillSearchService({
						searchUrl: ce.searchUrl,
						apiKey: ce.apiKey
					})
			: provideFakeSkillSearchService
	)()) as AppContext;
}
