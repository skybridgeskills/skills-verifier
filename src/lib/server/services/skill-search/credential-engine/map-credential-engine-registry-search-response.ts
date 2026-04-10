import {
	RegistryContainerSearchResult,
	RegistryFrameworkSearchResult
} from '../skill-search-service.js';

import {
	ceSearchItemsFromResponse,
	extractCeLanguageString
} from './map-credential-engine-search-response.js';

interface RegistrySearchItem {
	'@id'?: string;
	'@type'?: string | string[];
	'ceterms:ctid'?: string;
	'ceterms:name'?: Record<string, string> | string;
	'ceasn:name'?: Record<string, string> | string;
	'schema:name'?: Record<string, string> | string;
	'ceterms:description'?: Record<string, string> | string;
	'ceasn:description'?: Record<string, string> | string;
	'schema:description'?: Record<string, string> | string;
	'ceasn:publisherName'?: Record<string, string> | string;
	'ceasn:hasTopChild'?: string[];
	'ceasn:skillEmbodied'?: string[];
	'ceasn:knowledgeEmbodied'?: string[];
	'ceasn:abilityEmbodied'?: string[];
}

function primaryTypeRaw(item: RegistrySearchItem): string {
	const t = item['@type'];
	if (Array.isArray(t)) return typeof t[0] === 'string' ? t[0] : '';
	return typeof t === 'string' ? t : '';
}

function inferCtdlContainerType(raw: string): 'Job' | 'Occupation' | 'WorkRole' | 'Task' {
	const u = raw.toLowerCase();
	if (u.includes('workrole') || u.endsWith('#workrole')) return 'WorkRole';
	if (u.includes('occupation') || u.endsWith('#occupation')) return 'Occupation';
	if (u.includes('job') && !u.includes('occupation')) return 'Job';
	if (u.includes('task')) return 'Task';
	return 'Occupation';
}

function isFrameworkType(raw: string): boolean {
	const u = raw.toLowerCase();
	return u.includes('competencyframework');
}

/** Skip plain ASN competencies when querying for jobs/occupations; they use `ceasn:Competency`. */
function isPlainCompetencyType(raw: string): boolean {
	const tail = raw.split(/[#/:]/).pop()?.toLowerCase() ?? raw.toLowerCase();
	return tail === 'competency';
}

function ctidFromItem(item: RegistrySearchItem, uri: string): string {
	if (typeof item['ceterms:ctid'] === 'string' && item['ceterms:ctid'].length > 0) {
		return item['ceterms:ctid'];
	}
	try {
		const path = new URL(uri).pathname;
		const base = path.split('/').pop() ?? uri;
		return base || uri;
	} catch {
		return uri;
	}
}

function uniqueUrlCount(...arrays: (string[] | undefined)[]): number {
	const s = new Set<string>();
	for (const arr of arrays) {
		if (!arr) continue;
		for (const u of arr) {
			if (typeof u === 'string' && u.length > 0) s.add(u);
		}
	}
	return s.size;
}

/** Map CE Assistant Search JSON to container summary rows (Job/Occupation/WorkRole/Task). */
export function mapCredentialEngineContainerSearchResponse(
	ceResponse: unknown
): ReturnType<typeof RegistryContainerSearchResult>[] {
	const items = ceSearchItemsFromResponse(ceResponse as object) as RegistrySearchItem[];
	const out: ReturnType<typeof RegistryContainerSearchResult>[] = [];

	for (const item of items) {
		if (typeof item['@id'] !== 'string' || item['@id'].length === 0) continue;
		const rawType = primaryTypeRaw(item);
		if (isFrameworkType(rawType) || isPlainCompetencyType(rawType)) continue;

		const uri = item['@id'];
		const name =
			extractCeLanguageString(item['ceterms:name']) ??
			extractCeLanguageString(item['ceasn:name']) ??
			extractCeLanguageString(item['schema:name']) ??
			'Unnamed';
		const description =
			extractCeLanguageString(item['ceterms:description']) ??
			extractCeLanguageString(item['ceasn:description']) ??
			extractCeLanguageString(item['schema:description']);

		const skillCount = uniqueUrlCount(
			item['ceasn:skillEmbodied'],
			item['ceasn:knowledgeEmbodied'],
			item['ceasn:abilityEmbodied']
		);

		out.push(
			RegistryContainerSearchResult({
				'@id': uri,
				'@type': inferCtdlContainerType(rawType),
				'ceterms:ctid': ctidFromItem(item, uri),
				name,
				...(description ? { description } : {}),
				skillCount
			})
		);
	}

	return out;
}

/** Map CE Assistant Search JSON to competency framework summary rows. */
export function mapCredentialEngineFrameworkSearchResponse(
	ceResponse: unknown
): ReturnType<typeof RegistryFrameworkSearchResult>[] {
	const items = ceSearchItemsFromResponse(ceResponse as object) as RegistrySearchItem[];
	const out: ReturnType<typeof RegistryFrameworkSearchResult>[] = [];

	for (const item of items) {
		if (typeof item['@id'] !== 'string' || item['@id'].length === 0) continue;
		const rawType = primaryTypeRaw(item);
		if (!isFrameworkType(rawType)) continue;

		const uri = item['@id'];
		const name =
			extractCeLanguageString(item['ceasn:name']) ??
			extractCeLanguageString(item['ceterms:name']) ??
			extractCeLanguageString(item['schema:name']) ??
			'Unnamed framework';
		const description =
			extractCeLanguageString(item['ceasn:description']) ??
			extractCeLanguageString(item['ceterms:description']) ??
			extractCeLanguageString(item['schema:description']);
		const publisher = extractCeLanguageString(item['ceasn:publisherName']);
		const skillCount = uniqueUrlCount(item['ceasn:hasTopChild']);

		out.push(
			RegistryFrameworkSearchResult({
				'@id': uri,
				'@type': 'CompetencyFramework',
				'ceterms:ctid': ctidFromItem(item, uri),
				name,
				...(description ? { description } : {}),
				...(publisher ? { publisher } : {}),
				skillCount
			})
		);
	}

	return out;
}
