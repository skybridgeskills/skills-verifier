import { z } from 'zod';

import { FrameworkClientCtx } from '$lib/clients/framework-client/framework-client.js';

import type { AppContext } from './app-context.js';
import { StorageDatabaseCtx } from './core/storage/storage-database-ctx.js';
import { RealIdServiceCtx } from './services/id-service/real-id-service.js';
import { provideCredentialEngineSkillSearchService } from './services/skill-search/credential-engine/provide-credential-engine-skill-search-service.js';
import { RealTimeServiceCtx } from './services/time-service/real-time-service.js';
import { Providers } from './util/provider/providers.js';
import { ZodFactory } from './util/zod-factory.js';

/** AWS / production env: Credential Engine skill search is required. */
const AwsSkillSearchEnv = ZodFactory(
	z.object({
		CREDENTIAL_ENGINE_SEARCH_URL: z.string().trim().min(1),
		CREDENTIAL_ENGINE_API_KEY: z.string().trim().min(1)
	})
);
export type AwsSkillSearchEnv = ReturnType<typeof AwsSkillSearchEnv>;

/**
 * Creates AppContext for `CONTEXT=aws` (production-style).
 */
export async function AwsAppContext(env: Record<string, unknown>): Promise<AppContext> {
	const ce = AwsSkillSearchEnv({
		CREDENTIAL_ENGINE_SEARCH_URL:
			typeof env.CREDENTIAL_ENGINE_SEARCH_URL === 'string' ? env.CREDENTIAL_ENGINE_SEARCH_URL : '',
		CREDENTIAL_ENGINE_API_KEY:
			typeof env.CREDENTIAL_ENGINE_API_KEY === 'string' ? env.CREDENTIAL_ENGINE_API_KEY : ''
	});

	return (await Providers(
		RealTimeServiceCtx,
		RealIdServiceCtx,
		FrameworkClientCtx,
		StorageDatabaseCtx,
		() =>
			provideCredentialEngineSkillSearchService({
				searchUrl: ce.CREDENTIAL_ENGINE_SEARCH_URL,
				apiKey: ce.CREDENTIAL_ENGINE_API_KEY
			})
	)()) as AppContext;
}
