<script lang="ts" module>
	import SkillItem from './SkillItem.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { Skill } from '$lib/types/job-profile';

	const { Story } = defineMeta({
		title: 'components/SkillItem',
		component: SkillItem,
		tags: ['autodocs'],
		argTypes: {},
		args: {},
	});

	const skillWithLabelOnly: Skill = {
		url: 'https://example.com/skill1',
		label: 'Health Information Systems',
		text: '',
		ctid: 'ce-skill-1',
	};

	const skillWithTextOnly: Skill = {
		url: 'https://example.com/skill2',
		text: 'Describe health care organizations from the perspective of key stakeholders.',
		ctid: 'ce-skill-2',
	};

	const skillWithBoth: Skill = {
		url: 'https://example.com/skill3',
		label: 'Health Information Systems',
		text: 'Understand and use health information systems effectively.',
		ctid: 'ce-skill-3',
	};

	function handleToggle(skill: Skill) {
		console.log('Toggle skill:', skill);
	}
</script>

<Story name="With Label Only">
	<div class="max-w-md">
		<SkillItem skill={skillWithLabelOnly} selected={false} onToggle={handleToggle} />
	</div>
</Story>

<Story name="With Text Only">
	<div class="max-w-md">
		<SkillItem skill={skillWithTextOnly} selected={false} onToggle={handleToggle} />
	</div>
</Story>

<Story name="With Label and Text">
	<div class="max-w-md">
		<SkillItem skill={skillWithBoth} selected={false} onToggle={handleToggle} />
	</div>
</Story>

<Story name="Selected State">
	<div class="max-w-md">
		<SkillItem skill={skillWithBoth} selected={true} onToggle={handleToggle} />
	</div>
</Story>

<Story name="Unselected State">
	<div class="max-w-md">
		<SkillItem skill={skillWithBoth} selected={false} onToggle={handleToggle} />
	</div>
</Story>

<Story name="Multiple Skills">
	<div class="space-y-2 @md:max-w-2xl">
		<SkillItem skill={skillWithLabelOnly} selected={false} onToggle={handleToggle} />
		<SkillItem skill={skillWithTextOnly} selected={true} onToggle={handleToggle} />
		<SkillItem skill={skillWithBoth} selected={false} onToggle={handleToggle} />
	</div>
</Story>
