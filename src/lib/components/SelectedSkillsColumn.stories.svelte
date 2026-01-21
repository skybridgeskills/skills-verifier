<script lang="ts" module>
	import SelectedSkillsColumn from './SelectedSkillsColumn.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { Skill } from '$lib/types/job-profile';

	const { Story } = defineMeta({
		title: 'components/SelectedSkillsColumn',
		component: SelectedSkillsColumn,
		tags: ['autodocs'],
		argTypes: {},
		args: {},
	});

	const mockSkills: Skill[] = [
		{
			url: 'https://example.com/skill1',
			label: 'Health Information Systems',
			text: 'Understand and use health information systems effectively.',
			ctid: 'ce-skill-1',
		},
		{
			url: 'https://example.com/skill2',
			text: 'Describe health care organizations from the perspective of key stakeholders.',
			ctid: 'ce-skill-2',
		},
		{
			url: 'https://example.com/skill3',
			text: 'Apply coding and classification systems in health information management.',
			ctid: 'ce-skill-3',
		},
		{
			url: 'https://example.com/skill4',
			label: 'Data Management',
			text: 'Manage health information data effectively.',
			ctid: 'ce-skill-4',
		},
		{
			url: 'https://example.com/skill5',
			text: 'Ensure compliance with health information regulations.',
			ctid: 'ce-skill-5',
		},
	];

	// Generate more skills for testing
	const generateSkills = (count: number): Skill[] => {
		return Array.from({ length: count }, (_, i) => ({
			url: `https://example.com/skill${i + 1}`,
			text: `Skill ${i + 1} description`,
			ctid: `ce-skill-${i + 1}`,
		}));
	};

	function handleRemove(skill: Skill) {
		console.log('Remove skill:', skill);
		alert(`Removed: ${skill.label || skill.text}`);
	}
</script>

<Story name="No Skills Selected">
	<div class="max-w-md">
		<SelectedSkillsColumn selectedSkills={[]} onRemoveSkill={handleRemove} />
	</div>
</Story>

<Story name="Five Skills Selected (Recommended)">
	<div class="max-w-md">
		<SelectedSkillsColumn
			selectedSkills={mockSkills.slice(0, 5)}
			onRemoveSkill={handleRemove}
		/>
	</div>
</Story>

<Story name="Ten Skills Selected (At Limit)">
	<div class="max-w-md">
		<SelectedSkillsColumn
			selectedSkills={generateSkills(10)}
			onRemoveSkill={handleRemove}
		/>
	</div>
</Story>

<Story name="Fifteen Skills Selected (Warning)">
	<div class="max-w-md">
		<SelectedSkillsColumn
			selectedSkills={generateSkills(15)}
			onRemoveSkill={handleRemove}
		/>
	</div>
</Story>

<Story name="Many Skills Selected">
	<div class="max-w-md">
		<SelectedSkillsColumn
			selectedSkills={generateSkills(25)}
			onRemoveSkill={handleRemove}
		/>
	</div>
</Story>

<Story name="With Mixed Label and Text">
	<div class="max-w-md">
		<SelectedSkillsColumn selectedSkills={mockSkills} onRemoveSkill={handleRemove} />
	</div>
</Story>

<Story name="Responsive Layout">
	<div class="w-full @md:max-w-lg @lg:max-w-xl">
		<SelectedSkillsColumn
			selectedSkills={mockSkills.slice(0, 8)}
			onRemoveSkill={handleRemove}
		/>
	</div>
</Story>
