import { describe, expect, it } from 'vitest';

import { mapCredentialEngineSearchResponse } from './map-credential-engine-search-response.js';

const ceFixture = {
	data: [
		{
			'@id': 'https://example.com/competency/1',
			'ceterms:ctid': 'ce-abc123',
			'ceasn:competencyText': {
				'en-US': 'JavaScript Programming'
			},
			'ceterms:description': {
				'en-US': 'Writing and maintaining JavaScript code'
			}
		},
		{
			'@id': 'https://example.com/competency/2',
			'ceterms:ctid': 'ce-def456',
			'ceterms:name': {
				'en-US': 'TypeScript Development'
			}
		},
		{
			'@id': 'https://example.com/job/3',
			'ceterms:ctid': 'ce-ghi789',
			'ceterms:name': 'Software Engineer',
			'ceterms:description': 'Develops software using modern tools'
		}
	]
};

describe('mapCredentialEngineSearchResponse', () => {
	it('maps CE response to SkillSearchResult DTOs', () => {
		const results = mapCredentialEngineSearchResponse(ceFixture);

		expect(results).toHaveLength(3);

		expect(results[0].id).toBe('https://example.com/competency/1');
		expect(results[0].name).toBe('JavaScript Programming');
		expect(results[0].ctid).toBe('ce-abc123');
		expect(results[0].description).toBe('Writing and maintaining JavaScript code');

		expect(results[1].name).toBe('TypeScript Development');
		expect(results[2].name).toBe('Software Engineer');
	});

	it('reads @graph when data is absent', () => {
		const g = { '@graph': ceFixture.data.slice(0, 1) };
		const results = mapCredentialEngineSearchResponse(g);
		expect(results).toHaveLength(1);
		expect(results[0].name).toBe('JavaScript Programming');
	});

	it('handles empty data array', () => {
		expect(mapCredentialEngineSearchResponse({ data: [] })).toEqual([]);
	});

	it('handles missing data field', () => {
		expect(mapCredentialEngineSearchResponse({})).toEqual([]);
	});

	it('skips items without @id', () => {
		const result = mapCredentialEngineSearchResponse({
			data: [{ 'ceterms:name': { 'en-US': 'Orphan' } }]
		});
		expect(result).toEqual([]);
	});

	it('handles plain string competency text', () => {
		const result = mapCredentialEngineSearchResponse({
			data: [
				{
					'@id': 'https://example.com/string-skill',
					'ceasn:competencyText': 'Plain String Name'
				}
			]
		});
		expect(result[0].name).toBe('Plain String Name');
	});
});
