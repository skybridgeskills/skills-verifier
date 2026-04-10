import { describe, expect, it } from 'vitest';

import { extractCompetencyUrlsFromCtdlEntity, extractSkillUrls } from './skill-search-client.js';

describe('extractCompetencyUrlsFromCtdlEntity', () => {
	it('merges embodied properties for occupations', () => {
		const container = {
			'@id': 'x',
			'@type': 'Occupation' as const,
			'ceterms:ctid': 'c',
			'ceterms:name': { 'en-US': 'N' },
			'ceasn:skillEmbodied': ['https://a/1'],
			'ceasn:abilityEmbodied': ['https://a/2'],
			skillCount: 2,
			skillUrls: []
		};
		expect(extractSkillUrls(container)).toEqual(['https://a/1', 'https://a/2']);
	});

	it('uses hasTopChild for competency frameworks', () => {
		const fw = {
			'@id': 'f',
			'@type': 'CompetencyFramework' as const,
			'ceterms:ctid': 'f',
			'ceasn:name': { 'en-US': 'F' },
			'ceasn:hasTopChild': ['https://t/1', 'https://t/1'],
			skillCount: 1,
			skillUrls: []
		};
		expect(extractCompetencyUrlsFromCtdlEntity(fw)).toEqual(['https://t/1']);
	});
});
