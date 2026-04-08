import { describe, expect, it } from 'vitest';

import { FakeSkillSearchService } from './fake-skill-search-service.js';
import { SkillSearchQuery } from './skill-search-service.js';

describe('FakeSkillSearchService', () => {
	const service = FakeSkillSearchService();

	it('returns empty array for non-matching query', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'xyznonexistent' }));
		expect(results).toEqual([]);
	});

	it('returns matching skills by name', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'JavaScript' }));
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].name).toContain('JavaScript');
	});

	it('returns matching skills by description', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'server' }));
		expect(results.length).toBeGreaterThan(0);
	});

	it('respects limit parameter', async () => {
		const results = await service.search(SkillSearchQuery({ query: 'a', limit: 2 }));
		expect(results.length).toBeLessThanOrEqual(2);
	});

	it('returns matching fake occupations', async () => {
		const results = await service.searchContainers(SkillSearchQuery({ query: 'nurse' }));
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].name).toContain('Nurse');
	});

	it('returns matching fake frameworks', async () => {
		const results = await service.searchFrameworks(SkillSearchQuery({ query: 'allied' }));
		expect(results).toHaveLength(1);
		expect(results[0].name).toContain('Allied');
	});
});
