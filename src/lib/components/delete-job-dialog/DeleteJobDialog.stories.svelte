<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { Button } from '$lib/components/ui/button/index.js';
	import type { JobResource } from '$lib/server/domain/job/job-resource.js';

	import DeleteJobDialog from './DeleteJobDialog.svelte';

	const job: JobResource = {
		id: 'job-mock-001',
		createdAt: new Date('2026-01-15T12:00:00Z'),
		externalId: 'ext-abc-123',
		externalUrl: 'https://careers.example.com/posting/123',
		name: 'Clinical Informatics Analyst',
		description: 'Support clinical workflows by maintaining data integrity in the EHR.',
		company: 'Regional Health Network',
		frameworks: [],
		skills: [],
		status: 'active'
	};

	const { Story } = defineMeta({
		title: 'components/DeleteJobDialog',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let ctaOpen = $state(false);
</script>

<Story name="Open">
	<DeleteJobDialog {job} open />
</Story>

<Story name="Triggered By CTA">
	<Button variant="destructive" onclick={() => (ctaOpen = true)}>Delete job</Button>
	<DeleteJobDialog {job} bind:open={ctaOpen} />
</Story>
