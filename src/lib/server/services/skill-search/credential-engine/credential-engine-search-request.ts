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

/**
 * CE Assistant Search for CTDL Jobs, Occupations, WorkRoles, and Tasks by keyword.
 * Uses `search:term` for broad text matching (name/description), per Registry Search API patterns.
 */
export function buildCredentialEngineContainerSearchRequest(
	query: SkillSearchQuery,
	searchUrl: string
): unknown {
	return {
		Query: {
			'@type': ['ceterms:Job', 'ceterms:Occupation', 'ceterms:WorkRole', 'ceterms:Task'],
			'search:term': query.query
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
			'@type': ['ceasn:CompetencyFramework'],
			'search:term': query.query
		},
		Skip: 0,
		Take: query.limit,
		Environment: ceAssistantEnvironmentFromSearchUrl(searchUrl)
	};
}
