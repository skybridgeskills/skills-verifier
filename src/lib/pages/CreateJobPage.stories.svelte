<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { FakeFrameworkService } from '$lib/services/framework-service';

	import CreateJobPage from './CreateJobPage.svelte';

	const { Story } = defineMeta({
		title: 'pages/CreateJobPage',
		argTypes: {},
		args: {}
	});

	const fakeService = new FakeFrameworkService();
</script>

<Story name="Initial State">
	<div class="max-w-6xl">
		<CreateJobPage service={fakeService} />
	</div>
</Story>

<Story name="Framework Load Error">
	<div class="max-w-6xl">
		<!-- Create a service that throws errors -->
		<CreateJobPage
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
