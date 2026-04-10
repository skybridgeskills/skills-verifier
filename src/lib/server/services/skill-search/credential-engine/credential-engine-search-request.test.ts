import { describe, expect, it } from 'vitest';

import { SkillSearchQuery } from '../skill-search-service.js';

import {
	buildCredentialEngineContainerSearchRequest,
	buildCredentialEngineSearchRequest
} from './credential-engine-search-request.js';

describe('buildCredentialEngineContainerSearchRequest', () => {
	it('uses ceterms:name and search:termGroup for job/occupation-style lookup', () => {
		const body = buildCredentialEngineContainerSearchRequest(
			SkillSearchQuery({ query: 'nursing', limit: 5 }),
			'https://credentialengine.org/assistant/search/ctdl'
		) as Record<string, unknown>;

		expect(body.Skip).toBe(0);
		expect(body.Take).toBe(5);
		expect(body.Environment).toBe('Production');

		const q = body.Query as Record<string, unknown>;
		expect(q['@type']).toEqual([
			'ceterms:Job',
			'ceterms:Occupation',
			'ceterms:Task',
			'ceterms:WorkRole'
		]);
		expect(q['ceterms:name']).toBe('nursing');
		expect(q['search:termGroup']).toEqual({
			'search:operator': 'search:orTerms',
			'ceasn:abilityEmbodied': 'search:anyValue',
			'ceasn:knowledgeEmbodied': 'search:anyValue',
			'ceasn:skillEmbodied': 'search:anyValue',
			'ceterms:targetCompetency': 'search:anyValue'
		});
	});

	it('does not reuse the competency-only query shape', () => {
		const skillBody = buildCredentialEngineSearchRequest(
			SkillSearchQuery({ query: 'nursing', limit: 5 }),
			'https://example.com/search'
		) as Record<string, unknown>;
		const containerBody = buildCredentialEngineContainerSearchRequest(
			SkillSearchQuery({ query: 'nursing', limit: 5 }),
			'https://example.com/search'
		) as Record<string, unknown>;

		expect(skillBody.Query).not.toEqual(containerBody.Query);
	});
});
