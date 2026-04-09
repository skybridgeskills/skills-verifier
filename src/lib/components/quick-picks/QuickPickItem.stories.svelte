<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';

	import { QUICK_PICKS } from '$lib/config/sample-entities';
	import type { QuickPickItem } from '$lib/types/job-profile';

	import QuickPickItemComponent from './QuickPickItem.svelte';

	/** Storybook Actions: QuickPickItem invokes this with no arguments. */
	const onClick = fn();

	function pickKey(pick: QuickPickItem): string {
		if (pick.type === 'Skill') return (pick.entity as { url: string }).url;
		return (pick.entity as { '@id': string })['@id'];
	}

	const occupationPick = QUICK_PICKS.find((p) => p.type === 'Occupation') ?? QUICK_PICKS[0];
	const jobPick = QUICK_PICKS.find((p) => p.type === 'Job') ?? QUICK_PICKS[0];

	const frameworkPick: QuickPickItem = {
		type: 'Framework',
		entity: {
			'@id': 'https://credentialengineregistry.org/resources/fw-storybook',
			'@type': 'CompetencyFramework',
			'ceterms:ctid': 'ce-fw-storybook',
			name: 'Allied Health Competencies',
			description: 'Illustrative framework row for QuickPickItem.',
			skillCount: 12
		},
		skills: [
			{
				url: 'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac',
				label: 'Critical Thinking',
				ctid: 'ce-07c260d5-9119-11e8-b852-782bcb5df6ac'
			}
		]
	};

	const { Story } = defineMeta({
		title: 'components/QuickPicks/QuickPickItem',
		tags: ['autodocs']
	});
</script>

<Story name="Skill Type">
	<QuickPickItemComponent pick={QUICK_PICKS[0]} isSelected={false} {onClick} />
</Story>

<Story name="Occupation Type">
	<QuickPickItemComponent pick={occupationPick} isSelected={false} {onClick} />
</Story>

<Story name="Job Type">
	<QuickPickItemComponent pick={jobPick} isSelected={false} {onClick} />
</Story>

<Story name="Framework Type">
	<QuickPickItemComponent pick={frameworkPick} isSelected={false} {onClick} />
</Story>

<Story name="Selected">
	<QuickPickItemComponent pick={QUICK_PICKS[0]} isSelected={true} {onClick} />
</Story>

<Story name="All Types">
	<div class="flex flex-wrap gap-2">
		{#each QUICK_PICKS.slice(0, 6) as pick (pickKey(pick))}
			<QuickPickItemComponent {pick} isSelected={false} {onClick} />
		{/each}
	</div>
</Story>
