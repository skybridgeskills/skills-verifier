import { logServiceInitialized } from '../../../util/log-service-initialized.js';
import type { SkillSearchServiceCtx } from '../skill-search-service.js';

import { CredentialEngineSkillSearchService } from './credential-engine-skill-search-service.js';

function searchOriginFromUrl(searchUrl: string): string {
	try {
		return new URL(searchUrl).origin;
	} catch {
		return 'invalid-url';
	}
}

export function provideCredentialEngineSkillSearchService(config: {
	searchUrl: string;
	apiKey: string;
}): SkillSearchServiceCtx {
	const skillSearchService = CredentialEngineSkillSearchService({
		searchUrl: config.searchUrl,
		apiKey: config.apiKey
	});
	logServiceInitialized('skillSearchService', 'credential-engine', {
		searchOrigin: searchOriginFromUrl(config.searchUrl)
	});
	return { skillSearchService };
}
