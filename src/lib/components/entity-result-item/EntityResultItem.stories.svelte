<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import EntityResultItem from './EntityResultItem.svelte';

	const { Story } = defineMeta({
		title: 'components/EntityResultItem',
		tags: ['autodocs']
	});

	const occupationExample = {
		'@id': 'https://credentialengineregistry.org/resources/ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
		'@type': 'Occupation' as const,
		'ceterms:ctid': 'ce-03b75cdc-0dbf-4fc9-89ed-14a3beebbf4c',
		name: 'Acute Care Nurses',
		description: 'Provide advanced nursing care for patients with acute conditions.',
		skillCount: 30
	};

	const frameworkExample = {
		'@id': 'https://credentialengineregistry.org/resources/fw-1',
		'@type': 'CompetencyFramework' as const,
		'ceterms:ctid': 'ce-fw-demo',
		name: 'Sample Nursing Framework',
		description: 'A competency framework for illustration.',
		skillCount: 42
	};
</script>

<Story name="Occupation">
	<div class="max-w-md">
		<EntityResultItem entity={occupationExample} onSelect={() => {}} />
	</div>
</Story>

<Story name="Framework">
	<div class="max-w-md">
		<EntityResultItem entity={frameworkExample} onSelect={() => {}} />
	</div>
</Story>

<Story name="Without description">
	<div class="max-w-md">
		<EntityResultItem
			entity={{
				'@id': 'https://credentialengineregistry.org/resources/ce-x',
				'@type': 'Task',
				'ceterms:ctid': 'ce-x',
				name: 'Short task',
				skillCount: 3
			}}
			onSelect={() => {}}
		/>
	</div>
</Story>
