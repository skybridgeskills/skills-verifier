import { describe, expect, it } from 'vitest';

import { normalizeCtdlResourceNode, pickPrimaryNodeFromJsonLd } from './normalize-ctdl-resource.js';

describe('normalizeCtdlResourceNode', () => {
	it('normalizes ceterms:Occupation with embodied arrays', () => {
		const url = 'https://credentialengineregistry.org/resources/ce-o1';
		const node = {
			'@id': url,
			'@type': 'ceterms:Occupation',
			'ceterms:ctid': 'ce-o1',
			'ceterms:name': { 'en-US': 'Nurse' },
			'ceasn:skillEmbodied': ['https://credentialengineregistry.org/resources/ce-s1'],
			'ceasn:knowledgeEmbodied': ['https://credentialengineregistry.org/resources/ce-s1']
		};
		const n = normalizeCtdlResourceNode(node, url);
		expect(n['@type']).toBe('Occupation');
		expect(n.skillCount).toBe(1);
		expect(n.skillUrls).toEqual(['https://credentialengineregistry.org/resources/ce-s1']);
	});

	it('normalizes ceasn:CompetencyFramework', () => {
		const url = 'https://credentialengineregistry.org/resources/ce-fw';
		const node = {
			'@id': url,
			'@type': 'ceasn:CompetencyFramework',
			'ceterms:ctid': 'ce-fw',
			'ceasn:name': { 'en-US': 'FW' },
			'ceasn:hasTopChild': [
				'https://credentialengineregistry.org/resources/a',
				'https://credentialengineregistry.org/resources/b'
			]
		};
		const n = normalizeCtdlResourceNode(node, url);
		expect(n['@type']).toBe('CompetencyFramework');
		expect(n.skillCount).toBe(2);
	});
});

describe('pickPrimaryNodeFromJsonLd', () => {
	it('finds node by @id in @graph', () => {
		const id = 'https://credentialengineregistry.org/resources/x';
		const data = {
			'@graph': [{ '@id': 'other' }, { '@id': id, 'ceterms:ctid': 'x' }]
		};
		const node = pickPrimaryNodeFromJsonLd(data, id);
		expect(node?.['ceterms:ctid']).toBe('x');
	});
});
