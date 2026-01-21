<script lang="ts" module>
	import FrameworkSelector from './FrameworkSelector.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { FRAMEWORKS } from '$lib/config/frameworks';
	import type { Framework } from '$lib/types/job-profile';

	const { Story } = defineMeta({
		title: 'components/FrameworkSelector',
		component: FrameworkSelector,
		tags: ['autodocs'],
		argTypes: {},
		args: {},
	});

	function handleSelect(framework: Framework) {
		console.log('Framework selected:', framework);
		alert(`Selected: ${framework.name} by ${framework.organization}`);
	}
</script>

<Story name="Default">
	<div class="max-w-2xl">
		<FrameworkSelector frameworks={FRAMEWORKS} onSelect={handleSelect} />
	</div>
</Story>

<Story name="With Search Filtering">
	<div class="max-w-2xl">
		<p class="mb-4 text-sm text-gray-600">
			Type in the search box to filter frameworks by name or organization.
		</p>
		<FrameworkSelector frameworks={FRAMEWORKS} onSelect={handleSelect} />
	</div>
</Story>

<Story name="Loading State">
	<div class="max-w-2xl">
		<FrameworkSelector frameworks={FRAMEWORKS} onSelect={handleSelect} loading={true} />
	</div>
</Story>

<Story name="Error State">
	<div class="max-w-2xl">
		<FrameworkSelector
			frameworks={FRAMEWORKS}
			onSelect={handleSelect}
			error="Failed to fetch framework data. Please try again."
		/>
	</div>
</Story>

<Story name="Empty Search Results">
	<div class="max-w-2xl">
		<p class="mb-4 text-sm text-gray-600">
			Type a search query that doesn't match any frameworks to see the empty state.
		</p>
		<FrameworkSelector frameworks={FRAMEWORKS} onSelect={handleSelect} />
	</div>
</Story>

<Story name="No Frameworks">
	<div class="max-w-2xl">
		<FrameworkSelector frameworks={[]} onSelect={handleSelect} />
	</div>
</Story>

<Story name="Responsive Layout">
	<div class="w-full @md:max-w-lg @lg:max-w-2xl">
		<FrameworkSelector frameworks={FRAMEWORKS} onSelect={handleSelect} />
	</div>
</Story>
