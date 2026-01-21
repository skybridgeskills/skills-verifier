<script lang="ts" module>
	import SkillsList from './SkillsList.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { FRAMEWORKS } from '$lib/config/frameworks';
	import { FakeFrameworkService } from '$lib/services/framework-service';
	import type { Skill } from '$lib/types/job-profile';

	const { Story } = defineMeta({
		title: 'components/SkillsList',
		component: SkillsList,
		tags: ['autodocs'],
		argTypes: {},
		args: {},
	});

	const fakeService = new FakeFrameworkService();

	const mockSkills: Skill[] = [
		{
			url: 'https://credentialengineregistry.org/resources/ce-777ff155-e07f-4843-9274-6a78783f6641',
			text: 'Describe health care organizations from the perspective of key stakeholders.',
			ctid: 'ce-777ff155-e07f-4843-9274-6a78783f6641',
		},
		{
			url: 'https://credentialengineregistry.org/resources/ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f',
			label: 'Health Information Systems',
			text: 'Understand and use health information systems effectively.',
			ctid: 'ce-2d1dbb27-e1d8-4acf-9cb9-501c3dc68d5f',
		},
		{
			url: 'https://credentialengineregistry.org/resources/ce-659726d0-2b18-4ea1-891e-565f02d94098',
			text: 'Apply coding and classification systems in health information management.',
			ctid: 'ce-659726d0-2b18-4ea1-891e-565f02d94098',
		},
	];

	function handleToggle(skill: Skill) {
		console.log('Toggle skill:', skill);
	}
</script>

<Story name="No Framework Selected">
	<div class="max-w-2xl">
		<SkillsList
			framework={null}
			selectedSkills={[]}
			onToggleSkill={handleToggle}
			service={fakeService}
		/>
	</div>
</Story>

<Story name="Loading Framework">
	<div class="max-w-2xl">
		<!-- Note: This story shows the loading state. In a real scenario, this would be triggered by selecting a framework -->
		<SkillsList
			framework={FRAMEWORKS[0]}
			selectedSkills={[]}
			onToggleSkill={handleToggle}
			service={fakeService}
		/>
		<script>
			// The component will automatically start loading when framework is set
		</script>
	</div>
</Story>

<Story name="With Skills Loaded">
	<div class="max-w-2xl">
		<SkillsList
			framework={FRAMEWORKS[0]}
			selectedSkills={[]}
			onToggleSkill={handleToggle}
			service={fakeService}
		/>
	</div>
</Story>

<Story name="With Selected Skills">
	<div class="max-w-2xl">
		<SkillsList
			framework={FRAMEWORKS[0]}
			selectedSkills={[mockSkills[0], mockSkills[1]]}
			onToggleSkill={handleToggle}
			service={fakeService}
		/>
	</div>
</Story>

<Story name="With Search Filtering">
	<div class="max-w-2xl">
		<p class="mb-4 text-sm text-gray-600">
			Type in the search box to filter skills by label or text.
		</p>
		<SkillsList
			framework={FRAMEWORKS[0]}
			selectedSkills={[]}
			onToggleSkill={handleToggle}
			service={fakeService}
		/>
	</div>
</Story>

<Story name="Error State">
	<div class="max-w-2xl">
		<!-- Create a service that throws errors -->
		<SkillsList
			framework={FRAMEWORKS[0]}
			selectedSkills={[]}
			onToggleSkill={handleToggle}
			service={{
				async fetchFramework() {
					throw new Error('Failed to fetch framework: Network error');
				},
				async fetchSkill() {
					throw new Error('Failed to fetch skill');
				},
			}}
		/>
	</div>
</Story>

<Story name="Responsive Layout">
	<div class="w-full @md:max-w-lg @lg:max-w-2xl">
		<SkillsList
			framework={FRAMEWORKS[0]}
			selectedSkills={[]}
			onToggleSkill={handleToggle}
			service={fakeService}
		/>
	</div>
</Story>
