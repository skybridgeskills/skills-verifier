import type {
	SkillSearchQuery,
	SkillSearchResult,
	SkillSearchService
} from '../skill-search-service.js';

import { buildCredentialEngineSearchRequest } from './credential-engine-search-request.js';
import { mapCredentialEngineSearchResponse } from './map-credential-engine-search-response.js';

export interface CredentialEngineSkillSearchConfig {
	searchUrl: string;
	apiKey: string;
}

/** Credential Registry Search API client (server-only). */
export function CredentialEngineSkillSearchService(
	config: CredentialEngineSkillSearchConfig
): SkillSearchService {
	return {
		async search(query: SkillSearchQuery): Promise<SkillSearchResult[]> {
			const requestBody = buildCredentialEngineSearchRequest(query);

			const response = await fetch(config.searchUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${config.apiKey}`
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				throw new Error(`CE search failed: ${response.status} ${response.statusText}`);
			}

			const ceResponse: unknown = await response.json();
			return mapCredentialEngineSearchResponse(ceResponse);
		}
	};
}
