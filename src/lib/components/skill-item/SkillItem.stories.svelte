<script lang="ts" module>
	import SkillItem from './SkillItem.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import type { Skill } from '$lib/types/job-profile';

	const skillWithLabelOnly: Skill = {
		url: 'https://example.com/skill1',
		label: 'Health Information Systems',
		text: '',
		ctid: 'ce-skill-1'
	};

	const skillWithTextOnly: Skill = {
		url: 'https://example.com/skill2',
		text: 'Describe health care organizations from the perspective of key stakeholders.',
		ctid: 'ce-skill-2'
	};

	const skillWithBoth: Skill = {
		url: 'https://example.com/skill3',
		label: 'Health Information Systems',
		text: 'Understand and use health information systems effectively.',
		ctid: 'ce-skill-3'
	};

	const handleToggleAction = fn();

	let selectedState = $state<Record<string, boolean>>({
		[skillWithBoth.url]: true
	});

	function handleToggle(url: string) {
		selectedState[url] = !selectedState[url];
		handleToggleAction(url);
	}

	const { Story } = defineMeta({
		title: 'components/SkillItem',
		tags: ['autodocs'],
		argTypes: {
			onToggle: {
				action: 'skill toggled',
				description: 'Called when a skill checkbox is toggled'
			}
		},
		args: {
			onToggle: handleToggleAction
		}
	});
</script>

<Story name="With Label Only">
	<div class="max-w-md">
		<SkillItem
			skill={skillWithLabelOnly}
			selected={selectedState[skillWithLabelOnly.url] ?? false}
			onToggle={handleToggle}
		/>
	</div>
</Story>

<Story name="With Text Only">
	<div class="max-w-md">
		<SkillItem
			skill={skillWithTextOnly}
			selected={selectedState[skillWithTextOnly.url] ?? false}
			onToggle={handleToggle}
		/>
	</div>
</Story>

<Story name="With Label and Text">
	<div class="max-w-md">
		<SkillItem
			skill={skillWithBoth}
			selected={selectedState[skillWithBoth.url] ?? false}
			onToggle={handleToggle}
		/>
	</div>
</Story>

<Story name="Initially Selected">
	<div class="max-w-md">
		<SkillItem
			skill={{ ...skillWithBoth, url: 'https://selected.com/1' }}
			selected={selectedState['https://selected.com/1'] ?? true}
			onToggle={handleToggle}
		/>
	</div>
</Story>
