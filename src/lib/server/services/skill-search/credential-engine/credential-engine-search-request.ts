import type { SkillSearchQuery } from '../skill-search-service.js';

/**
 * Build Registry Search API POST body (CTDL JSON query + paging).
 * @see https://credreg.net/registry/searchapi
 */
export function buildCredentialEngineSearchRequest(query: SkillSearchQuery): unknown {
	return {
		'@type': [
			'ceasn:Competency',
			'ceterms:Job',
			'ceterms:Occupation',
			'ceterms:Task',
			'ceterms:WorkRole'
		],
		'search:term': query.query,
		'search:skip': 0,
		'search:take': query.limit,
		'ceterms:ctid': 'search:anyValue'
	};
}
