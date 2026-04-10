import type {
	CtdlCompetencyFramework,
	CtdlSkillContainer,
	CtdlSkillContainerType,
	LanguageString
} from '$lib/types/job-profile';

function asStringArray(v: unknown): string[] {
	if (!Array.isArray(v)) return [];
	return v.filter((x): x is string => typeof x === 'string' && x.length > 0);
}

function shortContainerType(raw: string): CtdlSkillContainerType {
	const t = raw.replace(/^(ceterms:|ceasn:)/i, '').trim();
	if (t === 'Job' || t === 'Occupation' || t === 'WorkRole' || t === 'Task') return t;
	return 'Occupation';
}

function isFrameworkType(raw: string): boolean {
	const t = raw
		.replace(/^(ceterms:|ceasn:)/i, '')
		.trim()
		.toLowerCase();
	return t === 'competencyframework' || raw.includes('CompetencyFramework');
}

/**
 * Normalize a single JSON-LD node from CE into our CTDL-aligned shapes with computed URLs.
 */
function rawJsonLdType(node: Record<string, unknown>): string {
	if (typeof node['@type'] === 'string') return node['@type'];
	if (Array.isArray(node['@type'])) {
		const first = node['@type'].find((x) => typeof x === 'string');
		if (typeof first === 'string') return first;
	}
	return 'ceterms:Occupation';
}

export function normalizeCtdlResourceNode(
	node: Record<string, unknown>,
	requestedId: string
): CtdlSkillContainer | CtdlCompetencyFramework {
	const rawType = rawJsonLdType(node);
	const id = typeof node['@id'] === 'string' ? node['@id'] : requestedId;
	const ctid =
		typeof node['ceterms:ctid'] === 'string' ? node['ceterms:ctid'] : (id.split('/').pop() ?? id);

	if (isFrameworkType(rawType)) {
		const hasTopChild = asStringArray(node['ceasn:hasTopChild']);
		const nameObj = node['ceasn:name'] as LanguageString | undefined;
		const descObj = node['ceasn:description'] as LanguageString | undefined;
		const pubObj = node['ceasn:publisherName'] as LanguageString | undefined;
		return {
			'@id': id,
			'@type': 'CompetencyFramework',
			'ceterms:ctid': ctid,
			'ceasn:name': nameObj ?? { 'en-US': 'Framework' },
			...(descObj ? { 'ceasn:description': descObj } : {}),
			...(pubObj ? { 'ceasn:publisherName': pubObj } : {}),
			'ceasn:hasTopChild': hasTopChild,
			skillCount: hasTopChild.length,
			skillUrls: [...new Set(hasTopChild)]
		};
	}

	const type = shortContainerType(rawType);
	const nameObj = node['ceterms:name'] as LanguageString | undefined;
	const descObj = node['ceterms:description'] as LanguageString | undefined;
	const skillEmbodied = asStringArray(node['ceasn:skillEmbodied']);
	const knowledgeEmbodied = asStringArray(node['ceasn:knowledgeEmbodied']);
	const abilityEmbodied = asStringArray(node['ceasn:abilityEmbodied']);
	const skillUrls = [...new Set([...skillEmbodied, ...knowledgeEmbodied, ...abilityEmbodied])];

	return {
		'@id': id,
		'@type': type,
		'ceterms:ctid': ctid,
		'ceterms:name': nameObj ?? { 'en-US': 'Untitled' },
		...(descObj ? { 'ceterms:description': descObj } : {}),
		'ceasn:skillEmbodied': skillEmbodied.length ? skillEmbodied : undefined,
		'ceasn:knowledgeEmbodied': knowledgeEmbodied.length ? knowledgeEmbodied : undefined,
		'ceasn:abilityEmbodied': abilityEmbodied.length ? abilityEmbodied : undefined,
		skillCount: skillUrls.length,
		skillUrls
	};
}

export function pickPrimaryNodeFromJsonLd(
	data: unknown,
	requestedId: string
): Record<string, unknown> | null {
	if (!data || typeof data !== 'object') return null;
	const root = data as Record<string, unknown>;
	const graph = root['@graph'];
	if (Array.isArray(graph)) {
		const match = graph.find(
			(g) =>
				g &&
				typeof g === 'object' &&
				typeof (g as Record<string, unknown>)['@id'] === 'string' &&
				(g as Record<string, unknown>)['@id'] === requestedId
		) as Record<string, unknown> | undefined;
		if (match) return match;
		const first = graph[0];
		if (first && typeof first === 'object') return first as Record<string, unknown>;
	}
	if (typeof root['@id'] === 'string') return root;
	return null;
}
