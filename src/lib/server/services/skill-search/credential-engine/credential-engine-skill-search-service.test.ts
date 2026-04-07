import { afterEach, describe, expect, it, vi } from 'vitest';

import { SkillSearchQuery } from '../skill-search-service.js';

import { CredentialEngineSkillSearchService } from './credential-engine-skill-search-service.js';

describe('CredentialEngineSkillSearchService', () => {
	const ceFixture = {
		data: [
			{
				'@id': 'https://example.com/c1',
				'ceasn:competencyText': { 'en-US': 'Nursing' }
			}
		]
	};

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('calls CE API with correct headers and body', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ceFixture
		});
		vi.stubGlobal('fetch', mockFetch);

		const service = CredentialEngineSkillSearchService({
			searchUrl: 'https://ce.example.com/search',
			apiKey: 'test-api-key'
		});

		await service.search(SkillSearchQuery({ query: 'Nursing', limit: 10 }));

		expect(mockFetch).toHaveBeenCalledWith(
			'https://ce.example.com/search',
			expect.objectContaining({
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer test-api-key'
				}
			})
		);

		const call = mockFetch.mock.calls[0];
		const init = call[1] as RequestInit;
		expect(JSON.parse(init.body as string)['search:term']).toBe('Nursing');
		expect(JSON.parse(init.body as string)['search:take']).toBe(10);
	});

	it('throws on non-ok response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				statusText: 'Unauthorized'
			})
		);

		const service = CredentialEngineSkillSearchService({
			searchUrl: 'https://ce.example.com/search',
			apiKey: 'bad-key'
		});

		await expect(service.search(SkillSearchQuery({ query: 'test' }))).rejects.toThrow(
			'CE search failed: 401 Unauthorized'
		);
	});
});
