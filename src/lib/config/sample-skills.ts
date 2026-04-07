import type { Skill } from '$lib/types/job-profile';

/**
 * Curated skills for local UX when no Credential Engine framework is selected.
 * URLs align with {@link FakeFrameworkClient} fixtures where possible.
 */
export const SAMPLE_SKILLS: Skill[] = [
	{
		url: 'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641',
		label: 'Health information systems',
		text: 'Understand and use health information systems effectively.',
		ctid: 'ce-777ff155-e07f-4843-9274-6a78783f6641'
	},
	{
		url: 'https://credentialengineregistry.org/resources/ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f',
		label: 'Health care organizations',
		text: 'Describe health care organizations from the perspective of key stakeholders.',
		ctid: 'ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f'
	},
	{
		url: 'https://credentialengineregistry.org/resources/ce-4ffae58e-900e-43e0-ad2b-58f17858edfc',
		text: 'Apply foundational business concepts to management scenarios.',
		ctid: 'ce-4ffae58e-900e-43e0-ad2b-58f17858edfc'
	}
];
