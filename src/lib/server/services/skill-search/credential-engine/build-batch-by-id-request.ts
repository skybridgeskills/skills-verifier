import { ceAssistantEnvironmentFromSearchUrl } from './credential-engine-search-request.js';

/**
 * Assistant search body: fetch many resources by `@id` list.
 */
export function buildBatchByIdRequest(urls: string[], searchUrl: string): unknown {
	const unique = [...new Set(urls.filter((u) => u.length > 0))];
	return {
		Query: { '@id': unique },
		Skip: 0,
		Take: Math.min(unique.length, 100),
		Environment: ceAssistantEnvironmentFromSearchUrl(searchUrl)
	};
}
