import {
	RegistryContainerSearchResult,
	RegistryFrameworkSearchResult,
	SkillSearchResult,
	type SkillSearchQuery,
	type SkillSearchService
} from './skill-search-service.js';

const FAKE_CONTAINERS: RegistryContainerSearchResult[] = [
	RegistryContainerSearchResult({
		'@id': 'https://credentialengineregistry.org/resources/ce-fake-occ-1',
		'@type': 'Occupation',
		'ceterms:ctid': 'ce-fake-occ-1',
		name: 'Acute Care Nurses',
		description: 'Nursing occupation for tests.',
		skillCount: 3
	}),
	RegistryContainerSearchResult({
		'@id': 'https://credentialengineregistry.org/resources/ce-fake-job-1',
		'@type': 'Job',
		'ceterms:ctid': 'ce-fake-job-1',
		name: 'Clinical Nurse Specialist',
		skillCount: 2
	})
];

const FAKE_FRAMEWORKS: RegistryFrameworkSearchResult[] = [
	RegistryFrameworkSearchResult({
		'@id': 'https://credentialengineregistry.org/resources/ce-fake-fw-1',
		'@type': 'CompetencyFramework',
		'ceterms:ctid': 'ce-fake-fw-1',
		name: 'Allied Health Competencies',
		publisher: 'Example Publisher',
		skillCount: 12
	})
];

const FAKE_SKILLS = [
	{
		id: '1',
		name: 'JavaScript Programming',
		uri: 'https://example.com/skills/js',
		description: 'Writing JavaScript code'
	},
	{
		id: '2',
		name: 'TypeScript Development',
		uri: 'https://example.com/skills/ts',
		description: 'Type-safe JavaScript development'
	},
	{
		id: '3',
		name: 'React Framework',
		uri: 'https://example.com/skills/react',
		description: 'Building UIs with React'
	},
	{
		id: '4',
		name: 'Node.js Backend',
		uri: 'https://example.com/skills/nodejs',
		description: 'Server-side JavaScript'
	},
	{
		id: '5',
		name: 'Database Design',
		uri: 'https://example.com/skills/db',
		description: 'Designing relational databases'
	},
	{
		id: '6',
		name: 'API Development',
		uri: 'https://example.com/skills/api',
		description: 'REST and GraphQL API design'
	},
	{
		id: '7',
		name: 'Cloud Infrastructure',
		uri: 'https://example.com/skills/cloud',
		description: 'AWS/GCP/Azure deployment'
	},
	{
		id: '8',
		name: 'DevOps Practices',
		uri: 'https://example.com/skills/devops',
		description: 'CI/CD and automation'
	}
];

/** Local/test skill search over a fixed skill list. */
export function FakeSkillSearchService(): SkillSearchService {
	return {
		async search(query: SkillSearchQuery): Promise<SkillSearchResult[]> {
			const searchLower = query.query.toLowerCase();
			const matches = FAKE_SKILLS.filter(
				(skill) =>
					skill.name.toLowerCase().includes(searchLower) ||
					skill.description.toLowerCase().includes(searchLower)
			);
			return matches.slice(0, query.limit).map((skill) =>
				SkillSearchResult({
					id: skill.id,
					name: skill.name,
					uri: skill.uri,
					description: skill.description
				})
			);
		},

		async searchContainers(query: SkillSearchQuery): Promise<RegistryContainerSearchResult[]> {
			const q = query.query.toLowerCase();
			return FAKE_CONTAINERS.filter(
				(c) =>
					c.name.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false)
			).slice(0, query.limit);
		},

		async searchFrameworks(query: SkillSearchQuery): Promise<RegistryFrameworkSearchResult[]> {
			const q = query.query.toLowerCase();
			return FAKE_FRAMEWORKS.filter(
				(f) => f.name.toLowerCase().includes(q) || (f.publisher?.toLowerCase().includes(q) ?? false)
			).slice(0, query.limit);
		}
	};
}
