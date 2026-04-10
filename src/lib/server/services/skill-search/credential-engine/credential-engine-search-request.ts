import type { SkillSearchQuery } from '../skill-search-service.js';

export type CeAssistantEnvironment = 'Production' | 'Sandbox';

/**
 * `POST …/assistant/search/ctdl` expects the same JSON envelope as
 * [Query Helper DoSearch](https://credreg.net/quickstart/queryhelper): `Query`, `Skip`, `Take`,
 * and `Environment`. A flat body with `search:skip` / `search:take` can return 500 on sandbox.
 */
export function ceAssistantEnvironmentFromSearchUrl(searchUrl: string): CeAssistantEnvironment {
	try {
		if (new URL(searchUrl).hostname.toLowerCase().includes('sandbox')) {
			return 'Sandbox';
		}
	} catch {
		/* invalid URL → Production */
	}
	return 'Production';
}

/**
 * Build POST body for Credential Engine Assistant Search (`/assistant/search/ctdl`).
 *
 * Inner query matches competencies with `ceasn:competencyText` (plain string), as in the
 * Query Helper.
 *
 * @see https://credreg.net/registry/searchapi — Search API Handbook
 * @see https://credreg.net/quickstart/queryhelper — Query Helper
 */
export function buildCredentialEngineSearchRequest(
	query: SkillSearchQuery,
	searchUrl: string
): unknown {
	return {
		Query: {
			'@type': ['ceasn:Competency'],
			'ceasn:competencyText': query.query
		},
		Skip: 0,
		Take: query.limit,
		Environment: ceAssistantEnvironmentFromSearchUrl(searchUrl)
	};
}

/** Nested term group for "has any embodied skill / target competency OR name match" style queries. */
const CONTAINER_SEARCH_TERM_GROUP = {
	'search:operator': 'search:orTerms',
	'ceasn:abilityEmbodied': 'search:anyValue',
	'ceasn:knowledgeEmbodied': 'search:anyValue',
	'ceasn:skillEmbodied': 'search:anyValue',
	'ceterms:targetCompetency': 'search:anyValue'
} as const;

/**
 * CE Assistant Search for CTDL Jobs, Occupations, WorkRoles, and Tasks.
 * Matches by `ceterms:name` and broadens via `search:termGroup` (embodied competencies, etc.).
 */
export function buildCredentialEngineContainerSearchRequest(
	query: SkillSearchQuery,
	searchUrl: string
): unknown {
	return {
		Query: {
			'@type': ['ceterms:Job', 'ceterms:Occupation', 'ceterms:Task', 'ceterms:WorkRole'],
			'ceterms:name': query.query,
			'search:termGroup': CONTAINER_SEARCH_TERM_GROUP
		},
		Skip: 0,
		Take: query.limit,
		Environment: ceAssistantEnvironmentFromSearchUrl(searchUrl)
	};
}

/** CE Assistant Search for competency frameworks by keyword. */
export function buildCredentialEngineFrameworkSearchRequest(
	query: SkillSearchQuery,
	searchUrl: string
): unknown {
	return {
		Query: {
			'@type': 'ceasn:CompetencyFramework',
			'ceasn:name': query.query
		},
		Skip: 0,
		Take: query.limit,
		Environment: ceAssistantEnvironmentFromSearchUrl(searchUrl)
	};
}
