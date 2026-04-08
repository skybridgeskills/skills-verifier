import type {
	Skill,
	CtdlSkillContainerSearchResult,
	CtdlFrameworkSearchResult,
	CtdlSkillContainer,
	CtdlCompetencyFramework
} from '$lib/types/job-profile';

/** Search mode for multi-entity type search */
export type SearchMode = 'skills' | 'containers' | 'frameworks';

/** One row from `POST /api/skill-search` (matches server `SkillSearchResult`). */
export interface SkillSearchApiResult {
	id: string;
	name: string;
	uri: string;
	ctid?: string;
	description?: string;
}

/** API response for skills mode */
interface SkillSearchApiResponse {
	results: SkillSearchApiResult[];
	meta: {
		query: string;
		count: number;
		limit: number;
	};
}

/** API response row for container mode */
interface ContainerSearchApiResult {
	'@id': string;
	'@type': string;
	'ceterms:ctid': string;
	name: string;
	description?: string;
	skillCount: number;
}

/** API response row for framework mode */
interface FrameworkSearchApiResult {
	'@id': string;
	'@type': 'CompetencyFramework';
	'ceterms:ctid': string;
	name: string;
	description?: string;
	publisher?: string;
	skillCount: number;
}

/** Multi-mode search response */
interface MultiModeSearchResponse {
	results: SkillSearchApiResult[] | ContainerSearchApiResult[] | FrameworkSearchApiResult[];
	meta: {
		query: string;
		count: number;
		limit: number;
		mode: SearchMode;
	};
}

/**
 * Map API row to {@link Skill} for UI / form submission.
 * Omits `text` when there is no separate description (avoids duplicate title/subtitle).
 */
export function mapApiSkillToSkill(result: SkillSearchApiResult): Skill {
	const description = result.description?.trim();
	return {
		url: result.uri,
		label: result.name,
		...(description ? { text: description } : {}),
		ctid: result.ctid?.trim() ? result.ctid : result.id
	};
}

/**
 * Map API result to CTDL skill container search result.
 */
function mapApiContainerToResult(result: ContainerSearchApiResult): CtdlSkillContainerSearchResult {
	const validTypes = ['Job', 'Occupation', 'WorkRole', 'Task'] as const;
	const type = validTypes.includes(result['@type'] as any)
		? (result['@type'] as any)
		: 'Occupation';
	return {
		'@id': result['@id'],
		'@type': type,
		'ceterms:ctid': result['ceterms:ctid'],
		name: result.name,
		description: result.description,
		skillCount: result.skillCount
	};
}

/**
 * Map API result to CTDL framework search result.
 */
function mapApiFrameworkToResult(result: FrameworkSearchApiResult): CtdlFrameworkSearchResult {
	return {
		'@id': result['@id'],
		'@type': 'CompetencyFramework',
		'ceterms:ctid': result['ceterms:ctid'],
		name: result.name,
		description: result.description,
		publisher: result.publisher,
		skillCount: result.skillCount
	};
}

/**
 * Search for entities via the app skill-search API.
 * Supports multiple modes: skills, containers (Jobs/Occupations/WorkRoles/Tasks), frameworks.
 */
export async function searchSkills(
	query: string,
	options?: {
		limit?: number;
		mode?: SearchMode;
	}
): Promise<Skill[] | CtdlSkillContainerSearchResult[] | CtdlFrameworkSearchResult[]> {
	const { limit = 20, mode = 'skills' } = options ?? {};

	const response = await fetch('/api/skill-search', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, limit, mode })
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => 'Unknown error');
		throw new Error(`Search failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as MultiModeSearchResponse;

	switch (mode) {
		case 'skills':
			return (data.results as SkillSearchApiResult[]).map(mapApiSkillToSkill);
		case 'containers':
			return (data.results as ContainerSearchApiResult[]).map(mapApiContainerToResult);
		case 'frameworks':
			return (data.results as FrameworkSearchApiResult[]).map(mapApiFrameworkToResult);
		default:
			throw new Error(`Unknown search mode: ${mode}`);
	}
}

/**
 * Batch fetch skills by their URLs.
 * Used when loading skills from a selected container or framework.
 */
export async function fetchSkillsByUrls(urls: string[]): Promise<Skill[]> {
	if (urls.length === 0) return [];

	const response = await fetch('/api/skills/batch', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ urls })
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => 'Unknown error');
		throw new Error(`Batch fetch failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as { results: SkillSearchApiResult[] };
	return data.results.map(mapApiSkillToSkill);
}

/**
 * Fetch a single CTDL resource (skill container or framework) by its URL.
 */
export async function fetchCtdlResource(
	url: string
): Promise<CtdlSkillContainer | CtdlCompetencyFramework> {
	const response = await fetch(`/api/resource?url=${encodeURIComponent(url)}`);

	if (!response.ok) {
		const errorText = await response.text().catch(() => 'Unknown error');
		throw new Error(`Resource fetch failed (${response.status}): ${errorText}`);
	}

	return (await response.json()) as CtdlSkillContainer | CtdlCompetencyFramework;
}

/**
 * Extract skill URLs from a CTDL skill container.
 * Combines and deduplicates skillEmbodied, knowledgeEmbodied, and abilityEmbodied.
 */
export function extractSkillUrls(container: CtdlSkillContainer): string[] {
	const skillUrls = container['ceasn:skillEmbodied'] ?? [];
	const knowledgeUrls = container['ceasn:knowledgeEmbodied'] ?? [];
	const abilityUrls = container['ceasn:abilityEmbodied'] ?? [];
	return [...new Set([...skillUrls, ...knowledgeUrls, ...abilityUrls])];
}
