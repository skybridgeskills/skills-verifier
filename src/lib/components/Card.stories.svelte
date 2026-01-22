<script lang="ts" module>
	import Card from './Card.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'components/Card',
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});
</script>

<Story name="Default">
	<Card>
		<h2 class="mb-2 text-xl font-semibold">Card Title</h2>
		<p class="text-gray-600">This is the default card with some content inside.</p>
	</Card>
</Story>

<Story name="With Long Content">
	<Card>
		<h2 class="mb-2 text-xl font-semibold">Card with Long Content</h2>
		<p class="mb-4 text-gray-600">
			This card demonstrates how the component handles longer content. The card should wrap the
			content nicely and maintain proper spacing and visual hierarchy.
		</p>
		<p class="text-gray-600">
			Additional paragraphs will also be properly spaced within the card container.
		</p>
	</Card>
</Story>

<Story name="Multiple Cards">
	<div class="grid grid-cols-1 gap-4 @md:grid-cols-2 @lg:grid-cols-3">
		<Card>
			<h3 class="mb-2 text-lg font-semibold">Card 1</h3>
			<p class="text-gray-600">First card in a responsive grid.</p>
		</Card>
		<Card>
			<h3 class="mb-2 text-lg font-semibold">Card 2</h3>
			<p class="text-gray-600">Second card in a responsive grid.</p>
		</Card>
		<Card>
			<h3 class="mb-2 text-lg font-semibold">Card 3</h3>
			<p class="text-gray-600">Third card in a responsive grid.</p>
		</Card>
	</div>
</Story>
