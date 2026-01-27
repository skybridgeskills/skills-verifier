<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';

	const { Story } = defineMeta({
		title: 'components/Card',
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});
</script>

<Story name="Default">
	<Card>
		<CardHeader>
			<CardTitle>Card Title</CardTitle>
			<CardDescription>This is the default card with some content inside.</CardDescription>
		</CardHeader>
		<CardContent>
			<p>Card content goes here.</p>
		</CardContent>
	</Card>
</Story>

<Story name="With Long Content">
	<Card>
		<CardHeader>
			<CardTitle>Card with Long Content</CardTitle>
			<CardDescription>
				This card demonstrates how the component handles longer content.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="mb-4">
				The card should wrap the content nicely and maintain proper spacing and visual hierarchy.
			</p>
			<p>Additional paragraphs will also be properly spaced within the card container.</p>
		</CardContent>
	</Card>
</Story>

<Story name="With Footer">
	<Card>
		<CardHeader>
			<CardTitle>Card with Footer</CardTitle>
			<CardDescription>This card includes a footer with actions.</CardDescription>
		</CardHeader>
		<CardContent>
			<p>Card content with a footer below.</p>
		</CardContent>
		<CardFooter>
			<Button>Action</Button>
		</CardFooter>
	</Card>
</Story>

<Story name="Multiple Cards">
	<div class="grid grid-cols-1 gap-4 @md:grid-cols-2 @lg:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle>Card 1</CardTitle>
			</CardHeader>
			<CardContent>
				<p>First card in a responsive grid.</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle>Card 2</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Second card in a responsive grid.</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle>Card 3</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Third card in a responsive grid.</p>
			</CardContent>
		</Card>
	</div>
</Story>
