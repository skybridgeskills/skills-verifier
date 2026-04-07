import type { Skill } from '$lib/types/job-profile';

/** One row from `POST /api/skill-search` (matches server `SkillSearchResult`). */
export interface SkillSearchApiResult {
	id: string;
	name: string;
	uri: string;
	ctid?: string;
	description?: string;
}

interface SkillSearchApiResponse {
	results: SkillSearchApiResult[];
	meta: {
		query: string;
		count: number;
		limit: number;
	};
}

/**
 * Map API row to persisted {@link Skill} shape (`text`/`label`/`ctid` required by job actions).
 */
export function mapApiSkillToSkill(result: SkillSearchApiResult): Skill {
	return {
		url: result.uri,
		label: result.name,
		text: result.description?.trim() ? result.description : result.name,
		ctid: result.ctid?.trim() ? result.ctid : result.id
	};
}

/**
 * Search for skills via the app skill-search API.
 */
export async function searchSkills(query: string, limit = 20): Promise<Skill[]> {
	const response = await fetch('/api/skill-search', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, limit })
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => 'Unknown error');
		throw new Error(`Search failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as SkillSearchApiResponse;
	return data.results.map(mapApiSkillToSkill);
}
