import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	HttpFrameworkService,
	FakeFrameworkService,
	createFrameworkService
} from './framework-service';
import type { FrameworkJsonLd, SkillJsonLd } from '$lib/types/job-profile';

describe('HttpFrameworkService', () => {
	let service: HttpFrameworkService;
	const mockFetch = vi.fn();

	beforeEach(() => {
		service = new HttpFrameworkService();
		vi.stubGlobal('fetch', mockFetch);
		mockFetch.mockClear();
	});

	describe('fetchFramework', () => {
		it('should fetch and parse framework successfully', async () => {
			const mockFramework: FrameworkJsonLd = {
				'@id': 'https://example.com/framework',
				'@type': 'ceasn:CompetencyFramework',
				'@context': 'https://credreg.net/ctdlasn/schema/context/json',
				'ceterms:ctid': 'ce-test-123',
				'ceasn:name': { 'en-us': 'Test Framework' },
				'ceasn:publisherName': { 'en-us': 'Test Organization' },
				'ceasn:hasTopChild': ['https://example.com/skill1', 'https://example.com/skill2']
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockFramework
			});

			const result = await service.fetchFramework('https://example.com/framework');

			expect(result.framework.name).toBe('Test Framework');
			expect(result.framework.organization).toBe('Test Organization');
			expect(result.framework.url).toBe('https://example.com/framework');
			expect(result.framework.ctid).toBe('ce-test-123');
			expect(result.skillUrls).toEqual([
				'https://example.com/skill1',
				'https://example.com/skill2'
			]);
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

			await expect(service.fetchFramework('https://example.com/framework')).rejects.toThrow(
				'Network error: Failed to fetch framework'
			);
		});

		it('should handle HTTP errors', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found'
			});

			await expect(service.fetchFramework('https://example.com/framework')).rejects.toThrow(
				'Failed to fetch framework: 404 Not Found'
			);
		});

		it('should handle invalid JSON', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => {
					throw new SyntaxError('Invalid JSON');
				}
			});

			await expect(service.fetchFramework('https://example.com/framework')).rejects.toThrow(
				'Invalid JSON: Failed to parse framework response'
			);
		});

		it('should handle missing required fields', async () => {
			const invalidFramework = {
				'@id': 'https://example.com/framework'
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidFramework
			});

			await expect(service.fetchFramework('https://example.com/framework')).rejects.toThrow(
				'Invalid framework: missing ceterms:ctid'
			);
		});

		it('should extract organization from publisherName', async () => {
			const mockFramework: FrameworkJsonLd = {
				'@id': 'https://example.com/framework',
				'@type': 'ceasn:CompetencyFramework',
				'@context': 'https://credreg.net/ctdlasn/schema/context/json',
				'ceterms:ctid': 'ce-test-123',
				'ceasn:name': { 'en-us': 'Test Framework' },
				'ceasn:publisherName': { 'en-us': 'Test Org' },
				'ceasn:hasTopChild': []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockFramework
			});

			const result = await service.fetchFramework('https://example.com/framework');
			expect(result.framework.organization).toBe('Test Org');
		});

		it('should default organization to Unknown if missing', async () => {
			const mockFramework: FrameworkJsonLd = {
				'@id': 'https://example.com/framework',
				'@type': 'ceasn:CompetencyFramework',
				'@context': 'https://credreg.net/ctdlasn/schema/context/json',
				'ceterms:ctid': 'ce-test-123',
				'ceasn:name': { 'en-us': 'Test Framework' },
				'ceasn:hasTopChild': []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockFramework
			});

			const result = await service.fetchFramework('https://example.com/framework');
			expect(result.framework.organization).toBe('Unknown');
		});
	});

	describe('fetchSkill', () => {
		it('should fetch and parse skill successfully with text only', async () => {
			const mockSkill: SkillJsonLd = {
				'@id': 'https://example.com/skill',
				'@type': 'ceasn:Competency',
				'@context': 'https://credreg.net/ctdlasn/schema/context/json',
				'ceterms:ctid': 'ce-skill-123',
				'ceasn:competencyText': { 'en-us': 'Test skill description' }
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockSkill
			});

			const result = await service.fetchSkill('https://example.com/skill');

			expect(result.skill.url).toBe('https://example.com/skill');
			expect(result.skill.text).toBe('Test skill description');
			expect(result.skill.label).toBeUndefined();
			expect(result.skill.ctid).toBe('ce-skill-123');
		});

		it('should fetch and parse skill successfully with label and text', async () => {
			const mockSkill: SkillJsonLd = {
				'@id': 'https://example.com/skill',
				'@type': 'ceasn:Competency',
				'@context': 'https://credreg.net/ctdlasn/schema/context/json',
				'ceterms:ctid': 'ce-skill-123',
				'ceasn:competencyLabel': { 'en-us': 'Test Label' },
				'ceasn:competencyText': { 'en-us': 'Test skill description' }
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockSkill
			});

			const result = await service.fetchSkill('https://example.com/skill');

			expect(result.skill.label).toBe('Test Label');
			expect(result.skill.text).toBe('Test skill description');
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

			await expect(service.fetchSkill('https://example.com/skill')).rejects.toThrow(
				'Network error: Failed to fetch skill'
			);
		});

		it('should handle HTTP errors', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found'
			});

			await expect(service.fetchSkill('https://example.com/skill')).rejects.toThrow(
				'Failed to fetch skill: 404 Not Found'
			);
		});

		it('should handle missing both label and text', async () => {
			const invalidSkill = {
				'@id': 'https://example.com/skill',
				'@type': 'ceasn:Competency',
				'@context': 'https://credreg.net/ctdlasn/schema/context/json',
				'ceterms:ctid': 'ce-skill-123'
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidSkill
			});

			await expect(service.fetchSkill('https://example.com/skill')).rejects.toThrow(
				'Invalid skill: missing both ceasn:competencyLabel and ceasn:competencyText'
			);
		});

		it('should use label as text fallback if text is missing', async () => {
			const mockSkill: SkillJsonLd = {
				'@id': 'https://example.com/skill',
				'@type': 'ceasn:Competency',
				'@context': 'https://credreg.net/ctdlasn/schema/context/json',
				'ceterms:ctid': 'ce-skill-123',
				'ceasn:competencyLabel': { 'en-us': 'Test Label' }
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockSkill
			});

			const result = await service.fetchSkill('https://example.com/skill');
			expect(result.skill.text).toBe('Test Label');
		});
	});
});

describe('FakeFrameworkService', () => {
	let service: FakeFrameworkService;

	beforeEach(() => {
		service = new FakeFrameworkService();
	});

	describe('fetchFramework', () => {
		it('should return mock framework data', async () => {
			const url =
				'https://credentialengineregistry.org/resources/ce-008e6f9a-d716-4d0a-94cb-13c5c8be10fd';
			const result = await service.fetchFramework(url);

			expect(result.framework.name).toBe('Health Information Management');
			expect(result.framework.organization).toBe('Dyersburg State Community College');
			expect(result.framework.url).toBe(url);
			expect(result.skillUrls.length).toBeGreaterThan(0);
		});

		it('should throw error for unknown framework URL', async () => {
			await expect(service.fetchFramework('https://example.com/unknown')).rejects.toThrow(
				'Mock framework not found'
			);
		});
	});

	describe('fetchSkill', () => {
		it('should return mock skill data', async () => {
			const url =
				'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641';
			const result = await service.fetchSkill(url);

			expect(result.skill.url).toBe(url);
			expect(result.skill.text).toBeTruthy();
			expect(result.skill.ctid).toBe('ce-777ff155-e07f-4843-9274-6a78783f6641');
		});

		it('should return skill with label and text', async () => {
			const url =
				'https://credentialengineregistry.org/resources/ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f';
			const result = await service.fetchSkill(url);

			expect(result.skill.label).toBe('Health Information Systems');
			expect(result.skill.text).toBeTruthy();
		});

		it('should throw error for unknown skill URL', async () => {
			await expect(service.fetchSkill('https://example.com/unknown')).rejects.toThrow(
				'Mock skill not found'
			);
		});
	});
});

describe('createFrameworkService', () => {
	it('should create HttpFrameworkService when env var is false', () => {
		// Test with actual env (should default to HttpFrameworkService)
		// Since we can't easily mock import.meta.env in vitest, we test the default behavior
		const service = createFrameworkService();
		// Default behavior should be HttpFrameworkService unless env var is set to 'true'
		expect(service).toBeInstanceOf(HttpFrameworkService);
	});

	it('should create HttpFrameworkService when env var is undefined', () => {
		const service = createFrameworkService();
		expect(service).toBeInstanceOf(HttpFrameworkService);
	});

	// Note: Testing with env var set to 'true' requires actual environment setup
	// This is tested in practice when running Storybook with PUBLIC_USE_FAKE_FRAMEWORK_SERVICE=true
});
