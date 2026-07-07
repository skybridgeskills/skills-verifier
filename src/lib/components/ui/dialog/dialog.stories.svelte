<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog/index.js';

	const { Story } = defineMeta({
		title: 'UI/Dialog',
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});
</script>

<Story name="Default">
	<Dialog>
		<DialogTrigger>
			{#snippet child({ props })}
				<Button {...props}>Open dialog</Button>
			{/snippet}
		</DialogTrigger>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Dialog title</DialogTitle>
				<DialogDescription>
					A generic centered dialog with a backdrop, focus trap, and close button.
				</DialogDescription>
			</DialogHeader>
			<p class="text-body-md text-foreground">
				Dialog body content goes here. Press Escape or click the backdrop to close.
			</p>
		</DialogContent>
	</Dialog>
</Story>

<Story name="With Footer Actions">
	<Dialog>
		<DialogTrigger>
			{#snippet child({ props })}
				<Button {...props} variant="secondary">Confirm action</Button>
			{/snippet}
		</DialogTrigger>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Are you sure?</DialogTitle>
				<DialogDescription>This dialog demonstrates a header, body, and footer.</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button variant="outline">Cancel</Button>
				<Button>Continue</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</Story>

<Story name="Open By Default">
	<Dialog open>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Already open</DialogTitle>
				<DialogDescription>
					This dialog starts open to show the content and close button.
				</DialogDescription>
			</DialogHeader>
		</DialogContent>
	</Dialog>
</Story>
