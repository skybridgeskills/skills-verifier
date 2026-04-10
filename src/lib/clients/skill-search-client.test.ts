import { describe, expect, it, vi } from 'vitest';

import { mapApiSkillToSkill, searchSkills } from './skill-search-client.js';

describe('mapApiSkillToSkill', () => {
	it('maps uri to url and uses id when ctid missing', () => {
		expect(
			mapApiSkillToSkill({
				id: 'ce-fallback',
				name: 'JavaScript',
				uri: 'https://ce.example/js'
			})
		).toEqual({
			url: 'https://ce.example/js',
			label: 'JavaScript',
			ctid: 'ce-fallback'
		});
	});

	it('uses description for text when present', () => {
		expect(
			mapApiSkillToSkill({
				id: 'x',
				name: 'JS',
				uri: 'https://ce.example/js',
				ctid: 'ce-js',
				description: 'Programming language'
			})
		).toEqual({
			url: 'https://ce.example/js',
			label: 'JS',
			text: 'Programming language',
			ctid: 'ce-js'
		});
	});
});

describe('searchSkills', () => {
	it('returns mapped skills on success', async () => {
		const mockResponse: unknown = {
			results: [
				{
					id: '1',
					name: 'JavaScript',
					uri: 'https://ce.com/js',
					ctid: 'ce-js',
					description: 'JS programming'
				},
				{ id: '2', name: 'TypeScript', uri: 'https://ce.com/ts' }
			],
			meta: { query: 'script', count: 2, limit: 20 }
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse
		});

		const skills = await searchSkills('script');

		expect(skills).toHaveLength(2);
		expect(skills[0]).toMatchObject({
			url: 'https://ce.com/js',
			label: 'JavaScript',
			text: 'JS programming',
			ctid: 'ce-js'
		});
		expect(skills[1]).toEqual({
			url: 'https://ce.com/ts',
			label: 'TypeScript',
			ctid: '2'
		});
	});

	it('throws on non-ok response', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			text: async () => 'Internal error'
		});

		await expect(searchSkills('test')).rejects.toThrow('Search failed (500)');
	});

	it('sends custom limit', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				results: [],
				meta: { query: 'test', count: 0, limit: 5 }
			})
		});
		global.fetch = mockFetch;

		await searchSkills('test', 5);

		expect(JSON.parse(mockFetch.mock.calls[0][1].body as string)).toEqual({
			query: 'test',
			limit: 5
		});
	});
});
