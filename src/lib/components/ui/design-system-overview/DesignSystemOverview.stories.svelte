<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import DesignSystemOverview from './DesignSystemOverview.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Overview',
		tags: []
	});
</script>

<Story name="Overview">
	<div class="min-h-screen bg-background p-8">
		<DesignSystemOverview />
	</div>
</Story>
