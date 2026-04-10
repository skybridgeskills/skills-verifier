<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { JobResource } from '$lib/server/domain/job/job-resource.js';

	import JobDetailPage from './JobDetailPage.svelte';

	const baseSkills = [
		{
			url: 'https://example.com/skill1',
			label: 'Health Information Systems',
			text: 'Understand and use health information systems effectively.',
			ctid: 'ce-skill-1'
		},
		{
			url: 'https://example.com/skill2',
			text: 'Describe health care organizations from the perspective of key stakeholders.',
			ctid: 'ce-skill-2'
		},
		{
			url: 'https://example.com/skill3',
			label: 'Data Management',
			text: 'Manage health information data effectively.',
			ctid: 'ce-skill-3'
		}
	];

	function makeJob(overrides: Partial<JobResource>): JobResource {
		return {
			id: 'job-mock-001',
			createdAt: new Date('2026-01-15T12:00:00Z'),
			externalId: 'ext-abc-123',
			externalUrl: 'https://careers.example.com/posting/123',
			name: 'Clinical Informatics Analyst',
			description:
				'Support clinical workflows by maintaining data integrity in the EHR and related systems. Collaborate with clinical and IT teams.',
			company: 'Regional Health Network',
			frameworks: [],
			skills: baseSkills,
			status: 'active',
			...overrides
		};
	}

	const { Story } = defineMeta({
		title: 'pages/JobDetailPage',
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div class="max-w-3xl">
		<JobDetailPage job={makeJob({})} />
	</div>
</Story>

<Story name="No External URL">
	<div class="max-w-3xl">
		<JobDetailPage job={makeJob({ externalUrl: undefined })} />
	</div>
</Story>

<Story name="Closed">
	<div class="max-w-3xl">
		<JobDetailPage job={makeJob({ status: 'closed' })} />
	</div>
</Story>

<Story name="Draft">
	<div class="max-w-3xl">
		<JobDetailPage job={makeJob({ status: 'draft' })} />
	</div>
</Story>

<Story name="Single Skill">
	<div class="max-w-3xl">
		<JobDetailPage job={makeJob({ skills: [baseSkills[0]!] })} />
	</div>
</Story>

<Story name="Many Skills">
	<div class="max-w-3xl">
		<JobDetailPage
			job={makeJob({
				skills: Array.from({ length: 18 }, (_, i) => ({
					url: `https://example.com/skill-bulk-${i}`,
					text: `Competency description for skill ${i + 1} in a high-volume job posting.`,
					ctid: `ce-bulk-${i}`
				}))
			})}
		/>
	</div>
</Story>

<Story name="No Skills">
	<div class="max-w-3xl">
		<JobDetailPage job={makeJob({ skills: [] })} />
	</div>
</Story>
