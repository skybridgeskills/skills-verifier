import type { SkillSearchServiceCtx } from '../skill-search-service.js';

import { CredentialEngineSkillSearchService } from './credential-engine-skill-search-service.js';

export function provideCredentialEngineSkillSearchService(config: {
	searchUrl: string;
	apiKey: string;
}): SkillSearchServiceCtx {
	return {
		skillSearchService: CredentialEngineSkillSearchService({
			searchUrl: config.searchUrl,
			apiKey: config.apiKey
		})
	};
}
