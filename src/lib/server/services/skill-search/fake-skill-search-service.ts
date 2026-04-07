import {
	SkillSearchResult,
	type SkillSearchQuery,
	type SkillSearchService
} from './skill-search-service.js';

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
		}
	};
}
