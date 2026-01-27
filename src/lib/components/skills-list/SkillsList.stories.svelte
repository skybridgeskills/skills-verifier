<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { FRAMEWORKS } from '$lib/config/frameworks';
	import { FakeFrameworkService } from '$lib/services/framework-service';
	import type { Skill } from '$lib/types/job-profile';

	import SkillsList from './SkillsList.svelte';

	const { Story } = defineMeta({
		title: 'components/SkillsList',
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});

	const fakeService = new FakeFrameworkService();

	const mockSkills: Skill[] = [
		{
			url: 'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641',
			text: 'Describe health care organizations from the perspective of key stakeholders.',
			ctid: 'ce-777ff155-e07f-4843-9274-6a78783f6641'
		},
		{
			url: 'https://credentialengineregistry.org/resources/ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f',
			label: 'Health Information Systems',
			text: 'Understand and use health information systems effectively.',
			ctid: 'ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f'
		},
		{
			url: 'https://credentialengineregistry.org/resources/ce-659726d0-2b18-4ea1-891e-565f02d94098',
			text: 'Apply coding and classification systems in health information management.',
			ctid: 'ce-659726d0-2b18-4ea1-891e-565f02d94098'
		}
	];

	let selectedSkills = $state<string[]>([]);
	let selectedSkillsWithPreselected = $state<string[]>([mockSkills[0].url, mockSkills[1].url]);

	function handleToggle(skill: Skill) {
		const skillId = skill.url;
		if (selectedSkills.includes(skillId)) {
			selectedSkills = selectedSkills.filter((id) => id !== skillId);
		} else {
			selectedSkills = [...selectedSkills, skillId];
		}
	}

	function handleToggleWithPreselected(skill: Skill) {
		const skillId = skill.url;
		if (selectedSkillsWithPreselected.includes(skillId)) {
			selectedSkillsWithPreselected = selectedSkillsWithPreselected.filter((id) => id !== skillId);
		} else {
			selectedSkillsWithPreselected = [...selectedSkillsWithPreselected, skillId];
		}
	}
</script>

<Story name="No Framework Selected">
	<div class="max-w-2xl">
		<SkillsList
			framework={null}
			{selectedSkills}
			onToggleSkill={handleToggle}
			service={fakeService}
		/>
	</div>
</Story>

<Story name="With Skills Loaded">
	<div class="max-w-2xl">
		<SkillsList
			framework={FRAMEWORKS[0]}
			{selectedSkills}
			onToggleSkill={handleToggle}
			service={fakeService}
		/>
	</div>
</Story>

<Story name="Initially Selected Skills">
	<div class="max-w-2xl">
		<SkillsList
			framework={FRAMEWORKS[0]}
			selectedSkills={selectedSkillsWithPreselected}
			onToggleSkill={handleToggleWithPreselected}
			service={fakeService}
		/>
	</div>
</Story>

<Story name="Error State">
	<div class="max-w-2xl">
		<!-- Create a service that throws errors -->
		<SkillsList
			framework={FRAMEWORKS[0]}
			{selectedSkills}
			onToggleSkill={handleToggle}
			service={{
				async fetchFramework() {
					throw new Error('Failed to fetch framework: Network error');
				},
				async fetchSkill() {
					throw new Error('Failed to fetch skill');
				}
			}}
		/>
	</div>
</Story>
