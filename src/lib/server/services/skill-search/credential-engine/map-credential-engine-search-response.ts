import { SkillSearchResult } from '../skill-search-service.js';

interface CEResponseItem {
	'@id'?: string;
	'ceterms:ctid'?: string;
	'ceasn:competencyText'?: Record<string, string> | string;
	'ceterms:name'?: Record<string, string> | string;
	'ceterms:description'?: Record<string, string> | string;
	'schema:name'?: Record<string, string> | string;
	'schema:description'?: Record<string, string> | string;
}

export function extractCeLanguageString(value: unknown): string | undefined {
	if (typeof value === 'string') return value;
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const map = value as Record<string, string>;
		return map['en-US'] ?? map['en'] ?? Object.values(map).find((x) => typeof x === 'string');
	}
	return undefined;
}

export function ceSearchItemsFromResponse(ceResponse: unknown): CEResponseItem[] {
	if (!ceResponse || typeof ceResponse !== 'object') return [];
	const r = ceResponse as Record<string, unknown>;
	if (Array.isArray(r.data)) return r.data as CEResponseItem[];
	if (Array.isArray(r['@graph'])) return r['@graph'] as CEResponseItem[];
	return [];
}

/** Map Credential Engine Search API JSON to app DTOs. */
export function mapCredentialEngineSearchResponse(
	ceResponse: unknown
): ReturnType<typeof SkillSearchResult>[] {
	const items = ceSearchItemsFromResponse(ceResponse).filter(
		(item): item is CEResponseItem & { '@id': string } =>
			typeof item['@id'] === 'string' && item['@id'].length > 0
	);

	return items.map((item) => {
		const uri = item['@id'];
		const name =
			extractCeLanguageString(item['ceasn:competencyText']) ??
			extractCeLanguageString(item['ceterms:name']) ??
			extractCeLanguageString(item['schema:name']) ??
			'Unnamed Skill';
		const description =
			extractCeLanguageString(item['ceterms:description']) ??
			extractCeLanguageString(item['schema:description']);

		return SkillSearchResult({
			id: uri,
			name,
			uri,
			ctid: item['ceterms:ctid'],
			description
		});
	});
}
