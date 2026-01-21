import type {
	Framework,
	FrameworkJsonLd,
	LanguageString,
	Skill,
	SkillJsonLd,
} from '$lib/types/job-profile';

/**
 * Response type for framework fetch operations.
 */
export interface FrameworkResponse {
	framework: Framework;
	skillUrls: string[];
}

/**
 * Response type for skill fetch operations.
 */
export interface SkillResponse {
	skill: Skill;
}

/**
 * Service interface for fetching framework and skill data.
 */
export interface FrameworkService {
	/**
	 * Fetches a framework by URL and returns framework data with skill URLs.
	 * @param url - The URL of the framework JSON-LD resource
	 * @returns Promise resolving to framework data and array of skill URLs
	 * @throws Error if fetch fails, JSON is invalid, or structure is invalid
	 */
	fetchFramework(url: string): Promise<FrameworkResponse>;

	/**
	 * Fetches a skill by URL and returns skill data.
	 * @param url - The URL of the skill JSON-LD resource
	 * @returns Promise resolving to skill data
	 * @throws Error if fetch fails, JSON is invalid, or structure is invalid
	 */
	fetchSkill(url: string): Promise<SkillResponse>;
}

/**
 * Extracts the English (en-us) value from a language-specific string object.
 * Falls back to the first available value if en-us is not present.
 */
function extractLanguageString(langString: LanguageString | undefined): string {
	if (!langString) {
		throw new Error('Language string is missing');
	}
	return langString['en-us'] ?? Object.values(langString)[0] ?? '';
}

/**
 * HTTP-based implementation of FrameworkService.
 * Fetches real JSON-LD data from Credential Engine Registry.
 */
export class HttpFrameworkService implements FrameworkService {
	async fetchFramework(url: string): Promise<FrameworkResponse> {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(
					`Failed to fetch framework: ${response.status} ${response.statusText}`,
				);
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
				ctid: json['ceterms:ctid'],
			};

			return {
				framework,
				skillUrls: json['ceasn:hasTopChild'],
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
				throw new Error(
					`Failed to fetch skill: ${response.status} ${response.statusText}`,
				);
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
					'Invalid skill: missing both ceasn:competencyLabel and ceasn:competencyText',
				);
			}

			const skill: Skill = {
				url: json['@id'],
				label,
				text: text || label || '',
				ctid: json['ceterms:ctid'],
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

/**
 * Mock/fake implementation of FrameworkService.
 * Returns predefined mock data for Storybook and testing.
 */
export class FakeFrameworkService implements FrameworkService {
	private mockFrameworks: Map<string, FrameworkJsonLd> = new Map();
	private mockSkills: Map<string, SkillJsonLd> = new Map();

	constructor() {
		this.initializeMockData();
	}

	private initializeMockData() {
		// Mock framework: Health Information Management
		const healthInfoFramework: FrameworkJsonLd = {
			'@id':
				'https://credentialengineregistry.org/resources/ce-008e6f9a-d716-4d0a-94cb-13c5c8be10fd',
			'@type': 'ceasn:CompetencyFramework',
			'@context': 'https://credreg.net/ctdlasn/schema/context/json',
			'ceterms:ctid': 'ce-008e6f9a-d716-4d0a-94cb-13c5c8be10fd',
			'ceasn:name': { 'en-us': 'Health Information Management' },
			'ceasn:publisherName': { 'en-us': 'Dyersburg State Community College' },
			'ceasn:description': {
				'en-us': 'These are the competencies associated with Health Information Management',
			},
			'ceasn:hasTopChild': [
				'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641',
				'https://credentialengineregistry.org/resources/ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f',
				'https://credentialengineregistry.org/resources/ce-659726d0-2b18-4ea1-891e-565f02d94098',
			],
		};

		// Mock framework: Business, Management
		const businessFramework: FrameworkJsonLd = {
			'@id':
				'https://credentialengineregistry.org/resources/ce-07220a5c-0f8a-4c5f-a458-acaebeea13f9',
			'@type': 'ceasn:CompetencyFramework',
			'@context': 'https://credreg.net/ctdlasn/schema/context/json',
			'ceterms:ctid': 'ce-07220a5c-0f8a-4c5f-a458-acaebeea13f9',
			'ceasn:name': { 'en-us': 'Business, Management' },
			'ceasn:publisherName': { 'en-us': 'Chattanooga State Community College' },
			'ceasn:description': {
				'en-us': 'These are the competencies associated with Business, Management',
			},
			'ceasn:hasTopChild': [
				'https://credentialengineregistry.org/resources/ce-4ffae58e-900e-43e0-ad2b-58f17858edfc',
				'https://credentialengineregistry.org/resources/ce-5d7b463c-3e84-43e1-9791-7766c9f5e856',
			],
		};

		this.mockFrameworks.set(healthInfoFramework['@id'], healthInfoFramework);
		this.mockFrameworks.set(businessFramework['@id'], businessFramework);

		// Mock skills for Health Information Management
		const skill1: SkillJsonLd = {
			'@id':
				'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641',
			'@type': 'ceasn:Competency',
			'@context': 'https://credreg.net/ctdlasn/schema/context/json',
			'ceterms:ctid': 'ce-777ff155-e07f-4843-9274-6a78783f6641',
			'ceasn:competencyText': {
				'en-us': 'Describe health care organizations from the perspective of key stakeholders.',
			},
		};

		const skill2: SkillJsonLd = {
			'@id':
				'https://credentialengineregistry.org/resources/ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f',
			'@type': 'ceasn:Competency',
			'@context': 'https://credreg.net/ctdlasn/schema/context/json',
			'ceterms:ctid': 'ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f',
			'ceasn:competencyLabel': { 'en-us': 'Health Information Systems' },
			'ceasn:competencyText': {
				'en-us': 'Understand and use health information systems effectively.',
			},
		};

		const skill3: SkillJsonLd = {
			'@id':
				'https://credentialengineregistry.org/resources/ce-659726d0-2b18-4ea1-891e-565f02d94098',
			'@type': 'ceasn:Competency',
			'@context': 'https://credreg.net/ctdlasn/schema/context/json',
			'ceterms:ctid': 'ce-659726d0-2b18-4ea1-891e-565f02d94098',
			'ceasn:competencyText': {
				'en-us': 'Apply coding and classification systems in health information management.',
			},
		};

		// Mock skills for Business, Management
		const businessSkill1: SkillJsonLd = {
			'@id':
				'https://credentialengineregistry.org/resources/ce-4ffae58e-900e-43e0-ad2b-58f17858edfc',
			'@type': 'ceasn:Competency',
			'@context': 'https://credreg.net/ctdlasn/schema/context/json',
			'ceterms:ctid': 'ce-4ffae58e-900e-43e0-ad2b-58f17858edfc',
			'ceasn:competencyText': {
				'en-us': 'Demonstrate understanding of business principles and practices.',
			},
		};

		const businessSkill2: SkillJsonLd = {
			'@id':
				'https://credentialengineregistry.org/resources/ce-5d7b463c-3e84-43e1-9791-7766c9f5e856',
			'@type': 'ceasn:Competency',
			'@context': 'https://credreg.net/ctdlasn/schema/context/json',
			'ceterms:ctid': 'ce-5d7b463c-3e84-43e1-9791-7766c9f5e856',
			'ceasn:competencyLabel': { 'en-us': 'Management Skills' },
			'ceasn:competencyText': {
				'en-us': 'Apply management principles to lead teams and projects effectively.',
			},
		};

		this.mockSkills.set(skill1['@id'], skill1);
		this.mockSkills.set(skill2['@id'], skill2);
		this.mockSkills.set(skill3['@id'], skill3);
		this.mockSkills.set(businessSkill1['@id'], businessSkill1);
		this.mockSkills.set(businessSkill2['@id'], businessSkill2);
	}

	async fetchFramework(url: string): Promise<FrameworkResponse> {
		const mockFramework = this.mockFrameworks.get(url);
		if (!mockFramework) {
			throw new Error(`Mock framework not found: ${url}`);
		}

		const name = extractLanguageString(mockFramework['ceasn:name']);
		const organization = extractLanguageString(mockFramework['ceasn:publisherName']) || 'Unknown';

		const framework: Framework = {
			name,
			organization,
			url: mockFramework['@id'],
			ctid: mockFramework['ceterms:ctid'],
		};

		return {
			framework,
			skillUrls: mockFramework['ceasn:hasTopChild'],
		};
	}

	async fetchSkill(url: string): Promise<SkillResponse> {
		const mockSkill = this.mockSkills.get(url);
		if (!mockSkill) {
			throw new Error(`Mock skill not found: ${url}`);
		}

		const label = mockSkill['ceasn:competencyLabel']
			? extractLanguageString(mockSkill['ceasn:competencyLabel'])
			: undefined;
		const text = mockSkill['ceasn:competencyText']
			? extractLanguageString(mockSkill['ceasn:competencyText'])
			: '';

		if (!text && !label) {
			throw new Error(
				'Invalid mock skill: missing both ceasn:competencyLabel and ceasn:competencyText',
			);
		}

		const skill: Skill = {
			url: mockSkill['@id'],
			label,
			text: text || label || '',
			ctid: mockSkill['ceterms:ctid'],
		};

		return { skill };
	}
}

/**
 * Creates a FrameworkService instance based on environment configuration.
 * Reads PUBLIC_USE_FAKE_FRAMEWORK_SERVICE from environment variables.
 * Uses import.meta.env which SvelteKit populates from PUBLIC_ prefixed env vars.
 * @returns FrameworkService instance (HttpFrameworkService or FakeFrameworkService)
 */
export function createFrameworkService(): FrameworkService {
	const useFake =
		import.meta.env.PUBLIC_USE_FAKE_FRAMEWORK_SERVICE === 'true' ||
		import.meta.env.PUBLIC_USE_FAKE_FRAMEWORK_SERVICE === true;

	return useFake ? new FakeFrameworkService() : new HttpFrameworkService();
}
