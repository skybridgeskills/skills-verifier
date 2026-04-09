<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import ColorPalette from './ColorPalette.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Color Palette',
		tags: ['autodocs']
	});
</script>

<Story name="All tokens">
	<div class="min-h-screen space-y-12 bg-background p-8">
		<ColorPalette />
	</div>
</Story>
