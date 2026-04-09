<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { Skill } from '$lib/types/job-profile';

	import CtdlSkillContainerView from './CtdlSkillContainerView.svelte';

	const { Story } = defineMeta({
		title: 'components/CtdlSkillContainerView/CtdlSkillContainerView',
		tags: ['autodocs']
	});

	const entityResult = {
		'@id': 'https://credentialengineregistry.org/resources/ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
		'@type': 'Occupation' as const,
		'ceterms:ctid': 'ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
		name: 'Acute Care Nurses',
		description: 'Sample occupation for Storybook.',
		skillCount: 2
	};

	const mockEntity = {
		'@id': entityResult['@id'],
		'@type': 'Occupation' as const,
		'ceterms:ctid': entityResult['ceterms:ctid'],
		'ceterms:name': { 'en-US': 'Acute Care Nurses' },
		'ceterms:description': { 'en-US': entityResult.description ?? '' },
		'ceasn:skillEmbodied': [
			'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac'
		],
		skillCount: 2,
		skillUrls: [
			'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac',
			'https://credentialengineregistry.org/resources/ce-07c2613a-9119-11e8-b852-782bcb5df6ac'
		]
	};

	const mockSkills: Skill[] = [
		{
			url: 'https://credentialengineregistry.org/resources/ce-07c260d5-9119-11e8-b852-782bcb5df6ac',
			label: 'Critical Thinking',
			text: 'Using logic to address problems.',
			ctid: 'ce-07c260d5-9119-11e8-b852-782bcb5df6ac'
		},
		{
			url: 'https://credentialengineregistry.org/resources/ce-07c2613a-9119-11e8-b852-782bcb5df6ac',
			label: 'Active Listening',
			ctid: 'ce-07c2613a-9119-11e8-b852-782bcb5df6ac'
		}
	];
</script>

<Story name="Loading (indefinite)">
	<div class="max-w-lg">
		<CtdlSkillContainerView
			{entityResult}
			selectedUrls={[]}
			onBack={() => {}}
			onToggleSkill={() => {}}
			onAddAll={() => {}}
			loadDetail={() => new Promise(() => {})}
		/>
	</div>
</Story>

<Story name="With mock load (no network)">
	<div class="max-w-lg">
		<CtdlSkillContainerView
			{entityResult}
			selectedUrls={[]}
			onBack={() => {}}
			onToggleSkill={() => {}}
			onAddAll={() => {}}
			loadDetail={async () => ({ entity: mockEntity, skills: mockSkills })}
		/>
	</div>
</Story>

<Story name="Partial selection">
	<div class="max-w-lg">
		<CtdlSkillContainerView
			{entityResult}
			selectedUrls={[mockSkills[0].url]}
			onBack={() => {}}
			onToggleSkill={() => {}}
			onAddAll={() => {}}
			loadDetail={async () => ({ entity: mockEntity, skills: mockSkills })}
		/>
	</div>
</Story>

<Story name="Empty skills">
	<div class="max-w-lg">
		<CtdlSkillContainerView
			{entityResult}
			selectedUrls={[]}
			onBack={() => {}}
			onToggleSkill={() => {}}
			onAddAll={() => {}}
			loadDetail={async () => ({
				entity: { ...mockEntity, skillUrls: [], skillCount: 0, 'ceasn:skillEmbodied': [] },
				skills: []
			})}
		/>
	</div>
</Story>

<Story name="Loading then error (mock)">
	<div class="max-w-lg">
		<CtdlSkillContainerView
			{entityResult}
			selectedUrls={[]}
			onBack={() => {}}
			onToggleSkill={() => {}}
			onAddAll={() => {}}
			loadDetail={async () => {
				throw new Error('Example load failure');
			}}
		/>
	</div>
</Story>
