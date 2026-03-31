import { extractLanguageString } from '$lib/clients/framework-client/fake-framework-client';
import type {
	FrameworkClient,
	FrameworkResponse,
	SkillResponse
} from '$lib/clients/framework-client/framework-client';
import type { Framework, FrameworkJsonLd, Skill, SkillJsonLd } from '$lib/types/job-profile';

/**
 * HTTP-based implementation of FrameworkClient.
 * Fetches real JSON-LD data from Credential Engine Registry.
 */
export class HttpFrameworkClient implements FrameworkClient {
	async fetchFramework(url: string): Promise<FrameworkResponse> {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Failed to fetch framework: ${response.status} ${response.statusText}`);
			}

			const json: FrameworkJsonLd = await response.json();

			// Validate required fields
			if (!json['@id']) {
				throw new Error('Invalid framework: missing @id');
			}
			if (!json['ceterms:ctid']) {
				throw new Error('Invalid framework: missing ceterms:ctid');
			}
			if (!json['ceasn:name']) {
				throw new Error('Invalid framework: missing ceasn:name');
			}
			if (!Array.isArray(json['ceasn:hasTopChild'])) {
				throw new Error('Invalid framework: missing or invalid ceasn:hasTopChild');
			}

			const name = extractLanguageString(json['ceasn:name']);
			const organization = json['ceasn:publisherName']
				? extractLanguageString(json['ceasn:publisherName'])
				: 'Unknown';

			const framework: Framework = {
				name,
				organization,
				url: json['@id'],
				ctid: json['ceterms:ctid']
			};

			return {
				framework,
				skillUrls: json['ceasn:hasTopChild']
			};
		} catch (error) {
			if (error instanceof TypeError) {
				throw new Error(`Network error: Failed to fetch framework from ${url}`);
			}
			if (error instanceof SyntaxError) {
				throw new Error(`Invalid JSON: Failed to parse framework response from ${url}`);
			}
			throw error;
		}
	}

	async fetchSkill(url: string): Promise<SkillResponse> {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Failed to fetch skill: ${response.status} ${response.statusText}`);
			}

			const json: SkillJsonLd = await response.json();

			// Validate required fields
			if (!json['@id']) {
				throw new Error('Invalid skill: missing @id');
			}
			if (!json['ceterms:ctid']) {
				throw new Error('Invalid skill: missing ceterms:ctid');
			}

			const label = json['ceasn:competencyLabel']
				? extractLanguageString(json['ceasn:competencyLabel'])
				: undefined;
			const text = json['ceasn:competencyText']
				? extractLanguageString(json['ceasn:competencyText'])
				: '';

			if (!text && !label) {
				throw new Error(
					'Invalid skill: missing both ceasn:competencyLabel and ceasn:competencyText'
				);
			}

			const skill: Skill = {
				url: json['@id'],
				label,
				text: text || label || '',
				ctid: json['ceterms:ctid']
			};

			return { skill };
		} catch (error) {
			if (error instanceof TypeError) {
				throw new Error(`Network error: Failed to fetch skill from ${url}`);
			}
			if (error instanceof SyntaxError) {
				throw new Error(`Invalid JSON: Failed to parse skill response from ${url}`);
			}
			throw error;
		}
	}
}
