import { describe, expect, it } from 'vitest';

import {
	mapCredentialEngineContainerSearchResponse,
	mapCredentialEngineFrameworkSearchResponse
} from './map-credential-engine-registry-search-response.js';

describe('mapCredentialEngineContainerSearchResponse', () => {
	it('maps job/occupation hits and skips plain competencies', () => {
		const ce = {
			data: [
				{
					'@id': 'https://example.com/occ1',
					'@type': 'ceterms:Occupation',
					'ceterms:ctid': 'ce-occ',
					'ceterms:name': { 'en-US': 'Acute Care Nurses' },
					'ceasn:skillEmbodied': ['https://example.com/s1', 'https://example.com/s2'],
					'ceasn:knowledgeEmbodied': ['https://example.com/s2']
				},
				{
					'@id': 'https://example.com/c1',
					'@type': 'ceasn:Competency',
					'ceasn:competencyText': { 'en-US': 'Should skip' }
				}
			]
		};

		const rows = mapCredentialEngineContainerSearchResponse(ce);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			'@id': 'https://example.com/occ1',
			'@type': 'Occupation',
			'ceterms:ctid': 'ce-occ',
			name: 'Acute Care Nurses',
			skillCount: 2
		});
	});
});

describe('mapCredentialEngineFrameworkSearchResponse', () => {
	it('maps competency frameworks using hasTopChild', () => {
		const ce = {
			data: [
				{
					'@id': 'https://example.com/fw1',
					'@type': 'ceasn:CompetencyFramework',
					'ceterms:ctid': 'ce-fw',
					'ceasn:name': { 'en-US': 'Health IT Framework' },
					'ceasn:hasTopChild': ['https://example.com/a', 'https://example.com/b']
				}
			]
		};

		const rows = mapCredentialEngineFrameworkSearchResponse(ce);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			'@id': 'https://example.com/fw1',
			'@type': 'CompetencyFramework',
			name: 'Health IT Framework',
			skillCount: 2
		});
	});
});
