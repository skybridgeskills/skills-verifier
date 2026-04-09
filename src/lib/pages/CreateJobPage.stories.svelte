<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { QUICK_PICKS } from '$lib/config/sample-entities';
	import { ResponsivePreview } from '$lib/storybook';
	import type { Skill, SkillWithSource } from '$lib/types/job-profile';

	import CreateJobPage from './CreateJobPage.svelte';

	const sampleSkill = QUICK_PICKS[0].entity as Skill;
	const withSelections: SkillWithSource[] = [
		{
			...sampleSkill,
			sourceCtdlContainer: {
				name: 'Acute Care Nurses',
				'@id': 'urn:demo:oc',
				'@type': 'Occupation'
			}
		}
	];

	const { Story } = defineMeta({
		title: 'pages/CreateJobPage',
		argTypes: {},
		args: {}
	});
</script>

<Story name="Initial State (desktop width)">
	<ResponsivePreview width={1100} label="Desktop — sidebar visible @lg">
		<CreateJobPage />
	</ResponsivePreview>
</Story>

<Story name="With form error">
	<ResponsivePreview width={1100}>
		<CreateJobPage
			form={{ error: 'Example server validation message', values: { name: '', company: '' } }}
		/>
	</ResponsivePreview>
</Story>

<Story name="With selections">
	<ResponsivePreview width={1100}>
		<CreateJobPage initialSelectedSkills={withSelections} />
	</ResponsivePreview>
</Story>

<Story name="Mobile (add-skills entry)">
	<ResponsivePreview width={375} label="Mobile — Add skills opens dialog">
		<CreateJobPage />
	</ResponsivePreview>
</Story>
