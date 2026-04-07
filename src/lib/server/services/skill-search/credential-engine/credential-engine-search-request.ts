import type { SkillSearchQuery } from '../skill-search-service.js';

/**
 * Build Registry Search API POST body (CTDL JSON query + paging).
 * Searches for competencies matching the query text.
 * @see https://credreg.net/registry/searchapi
 */
export function buildCredentialEngineSearchRequest(query: SkillSearchQuery): unknown {
	return {
		'@type': ['ceasn:Competency'],
		'search:termGroup': {
			'search:term': query.query
		},
		'search:skip': 0,
		'search:take': query.limit
	};
}
