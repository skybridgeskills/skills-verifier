<script lang="ts" module>
	import CreateJobPage from './CreateJobPage.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { FakeFrameworkService } from '$lib/services/framework-service';
	import { FRAMEWORKS } from '$lib/config/frameworks';
	import type { Skill } from '$lib/types/job-profile';

	const { Story } = defineMeta({
		title: 'pages/CreateJobPage',
		component: CreateJobPage,
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
	];
</script>

<Story name="Initial State">
	<div class="max-w-6xl">
		<CreateJobPage service={fakeService} />
	</div>
</Story>

<Story name="With Framework Selected">
	<div class="max-w-6xl">
		<CreateJobPage service={fakeService} />
		<script>
			// Note: Framework selection will trigger skills loading automatically
			// This story demonstrates the state after framework is selected
		</script>
	</div>
</Story>

<Story name="With Skills Selected">
	<div class="max-w-6xl">
		<CreateJobPage service={fakeService} />
		<script>
			// Note: Skills selection happens through user interaction
			// This story demonstrates the state with skills selected
		</script>
	</div>
</Story>

<Story name="With Form Filled">
	<div class="max-w-6xl">
		<CreateJobPage service={fakeService} />
		<p class="mb-4 text-sm text-gray-600">
			Fill out the form fields to see the complete state.
		</p>
	</div>
</Story>

<Story name="Success State">
	<div class="max-w-6xl">
		<CreateJobPage service={fakeService} />
		<p class="mb-4 text-sm text-gray-600">
			Fill out the form, select a framework, select skills, and click Save to see the success
			message.
		</p>
	</div>
</Story>

<Story name="Validation Errors">
	<div class="max-w-6xl">
		<CreateJobPage service={fakeService} />
		<p class="mb-4 text-sm text-gray-600">
			Try to save without filling the form or selecting skills to see validation errors.
		</p>
	</div>
</Story>

<Story name="Error State">
	<div class="max-w-6xl">
		<!-- Create a service that throws errors -->
		<CreateJobPage
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
	<div class="w-full @md:max-w-4xl @lg:max-w-6xl">
		<CreateJobPage service={fakeService} />
	</div>
</Story>
